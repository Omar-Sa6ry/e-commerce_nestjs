import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, MoreThan } from 'typeorm';
import { randomBytes } from 'crypto';
import { UserService } from '../users/users.service';
import { GenerateToken } from './jwt/jwt.service';
import { User } from '../users/entity/user.entity';
import { HashPassword } from './utils/hashPassword';
import { ChangePasswordDto } from './inputs/ChangePassword.dto';
import { ResetPasswordDto } from './inputs/ResetPassword.dto';
import { LoginDto } from './inputs/Login.dto';
import { ComparePassword } from './utils/comparePassword';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { Role } from 'src/common/constant/enum.constant';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { CreateUserDto } from './inputs/CreateUserData.dto';
import { UploadService } from '../../common/upload/upload.service';
import { I18nService } from 'nestjs-i18n';
import { WebSocketMessageGateway } from 'src/common/websocket/websocket.gateway';
import { UserInputResponse } from '../users/inputs/User.input';
import { AuthResponse } from './dto/AuthRes.dto';
import { CreateAddressInput } from '../address/inputs/createAddress.dto';
import { UserAddressService } from '../userAdress/userAddress.service';
import { CreateUserAddressInput } from '../userAdress/inputs/createUserAddress.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly i18n: I18nService,
    private userService: UserService,
    private readonly addressService: UserAddressService,
    private readonly generateToken: GenerateToken,
    private readonly redisService: RedisService,
    private readonly uploadService: UploadService,
    private readonly sendEmailService: SendEmailService,
    private readonly websocketGateway: WebSocketMessageGateway,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async register(
    fcmToken: string,
    createUserDto: CreateUserDto,
    avatar?: CreateImagDto,
    address?: CreateAddressInput,
    userAddress?: CreateUserAddressInput,
  ): Promise<AuthResponse> {
    const { email } = createUserDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const password = await HashPassword(createUserDto.password);
      const user = queryRunner.manager.create(User, {
        ...createUserDto,
        password,
      });

      if (avatar) {
        const filename = await this.uploadService.uploadImage(avatar);
        if (typeof filename === 'string') {
          user.avatar = filename;
        }
      }

      if (address && userAddress) {
        await this.addressService.connectAddressToUser(user.id, address, {
          ...userAddress,
          isDefault: true,
        });
      }

      user.fcmToken = fcmToken;
      await queryRunner.manager.save(user);

      const token = await this.generateToken.jwt(user.email, user.id);
      await queryRunner.commitTransaction();

      const result: AuthResponse = {
        data: { user, token },
        statusCode: 201,
        message: await this.i18n.t('user.CREATED'),
      };

      await this.redisService.set(`user:${user.id}`, user);
      await this.redisService.set(`auth:${user.id}`, result);

      this.websocketGateway.broadcast('userCreated', { userId: user.id, user });

      this.sendEmailService.sendEmail(
        email,
        'Register in App',
        'You registered successfully in the App',
      );

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(fcmToken: string, loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email } });
    if (!user)
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'));

    await ComparePassword(password, user.password);
    const token = await this.generateToken.jwt(user.email, user.id);

    user.fcmToken = fcmToken;
    await this.dataSource.getRepository(User).save(user);

    const result: AuthResponse = {
      data: { user, token },
      statusCode: 201,
      message: await this.i18n.t('user.LOGIN'),
    };

    await this.redisService.set(`user:${user.id}`, user);
    await this.redisService.set(`auth:${user.id}`, result);

    return result;
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    const lowerEmail = email.toLowerCase();
    const user = await (await this.userService.findByEmail(lowerEmail))?.data;
    if (!(user instanceof User))
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'));

    if ([Role.MANAGER, Role.ADMIN].includes(user.role))
      throw new BadRequestException(await this.i18n.t('user.NOT_ADMIN'));

    const token = randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    const link = `http://localhost:3000/grapql/reset-password?token=${token}`;
    await this.dataSource.getRepository(User).save(user);

    this.sendEmailService.sendEmail(
      lowerEmail,
      'Forgot Password',
      `Click here to reset your password: ${link}`,
    );

    return { message: await this.i18n.t('user.SEND_MSG'), data: null };
  }

  async resetPassword(
    resetPassword: ResetPasswordDto,
  ): Promise<UserInputResponse> {
    const { password, token } = resetPassword;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: {
          resetToken: token,
          resetTokenExpiry: MoreThan(new Date()),
        },
      });

      if (!user)
        throw new BadRequestException(await this.i18n.t('user.NOT_FOUND'));

      user.password = await HashPassword(password);
      await queryRunner.manager.save(user);

      await this.redisService.set(`user:${user.id}`, user);
      await queryRunner.commitTransaction();

      return { message: await this.i18n.t('user.UPDATE_PASSWORD'), data: user };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async changePassword(
    id: string,
    changePassword: ChangePasswordDto,
  ): Promise<UserInputResponse> {
    const { password, newPassword } = changePassword;

    if (password === newPassword)
      throw new BadRequestException(
        await this.i18n.t('user.LOGISANE_PASSWORD'),
      );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await (await this.userService.findById(id))?.data;
      if (!user)
        throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'));

      const isMatch = await ComparePassword(password, user.password);
      if (!isMatch)
        throw new BadRequestException(
          await this.i18n.t('user.OLD_IS_EQUAL_NEW'),
        );

      user.password = await HashPassword(newPassword);
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return { message: await this.i18n.t('user.UPDATE_PASSWORD'), data: user };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async roleBasedLogin(
    fcmToken: string,
    loginDto: LoginDto,
    role: Role,
  ): Promise<AuthResponse> {
    const { email, password } = loginDto;
    const user = await this.userService.findByEmail(email.toLowerCase());

    if (!(user instanceof User))
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'));

    if (user.role !== role)
      throw new UnauthorizedException(await this.i18n.t('user.NOT_ADMIN'));

    await ComparePassword(password, user.password);
    const token = await this.generateToken.jwt(user.email, user.id);

    user.fcmToken = fcmToken;
    await this.dataSource.getRepository(User).save(user);

    const result: AuthResponse = {
      data: { user, token },
      statusCode: 201,
      message: await this.i18n.t('user.LOGIN'),
    };

    await this.redisService.set(`user:${user.id}`, user);
    await this.redisService.set(`auth:${user.id}`, result);

    return result;
  }
}
