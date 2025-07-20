import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, MoreThan } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { RedisService } from 'src/common/redis/redis.service';
import { UploadService } from '../../common/upload/upload.service';
import { Role } from 'src/common/constant/enum.constant';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { ChangePasswordDto } from './inputs/ChangePassword.dto';
import { ResetPasswordDto } from './inputs/ResetPassword.dto';
import { LoginDto } from './inputs/Login.dto';
import { CreateUserDto } from './inputs/CreateUserData.dto';
import { AuthResponse } from './dto/AuthRes.dto';
import { CreateAddressInput } from '../address/inputs/createAddress.dto';
import { CreateUserAddressInput } from '../userAdress/inputs/createUserAddress.input';
import { UserService } from '../users/users.service';
import { UserResponse } from '../users/dto/UserResponse.dto';
import { UserAddressService } from '../userAdress/userAddress.service';
import { GenerateTokenFactory } from './jwt/jwt.service';
import { PasswordResetLinkBuilder } from './builder/PasswordResetLink.builder';
import { User } from '../users/entity/user.entity';
import { AuthServiceFacade } from './fascade/AuthService.facade';
import { IPasswordService } from './interfaces/IPassword.interface';
import { PasswordServiceAdapter } from './utils/IPasswordService';
import {
  PasswordValidator,
  RoleValidator,
  ValidatorComposite,
} from './composite/validator.composite';

@Injectable()
export class AuthService {
  private passwordService: IPasswordService;
  private authFacade: AuthServiceFacade;

  constructor(
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
    private readonly userService: UserService,
    private readonly tokenFactory: GenerateTokenFactory,
    private readonly addressService: UserAddressService,
    private readonly redisService: RedisService,
    private readonly uploadService: UploadService,
    private readonly emailService: SendEmailService,
  ) {
    this.passwordService = new PasswordServiceAdapter();
    this.authFacade = new AuthServiceFacade(
      this.i18n,
      userService,
      tokenFactory,
      this.passwordService,
      redisService,
    );
  }

  async register(
    createUserDto: CreateUserDto,
    avatar?: CreateImagDto,
    address?: CreateAddressInput,
    userAddress?: CreateUserAddressInput,
  ): Promise<AuthResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.createUser(
        queryRunner,
        createUserDto,
        avatar,
        address,
        userAddress,
      );

      const tokenService = await this.tokenFactory.createTokenGenerator();
      const token = await tokenService.generate(user.email, user.id);

      await queryRunner.commitTransaction();

      this.redisService.set(`user:${user.id}`, user);
      this.emailService.sendEmail(
        user.email,
        'Register in App',
        'You registered successfully in the App',
      );

      return {
        data: { user, token },
        message: await this.i18n.t('user.CREATED'),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password, fcmToken } = loginDto;
    const { user, token } = await this.authFacade.authenticate(email, password);

    user.fcmToken = fcmToken;
    await this.dataSource.getRepository(User).save(user);

    return { data: { user, token }, message: await this.i18n.t('user.LOGIN') };
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    const user = await this.validateUserForPasswordReset(email);

    const builder = new PasswordResetLinkBuilder();
    const link = builder.build();
    const token = builder.getToken();

    await this.updateUserResetToken(user, token);

    this.emailService.sendEmail(
      email,
      'Forgot Password',
      `Click here to reset your password: ${link}`,
    );
    return { message: await this.i18n.t('user.SEND_MSG'), data: null };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<UserResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.validateResetToken(
        queryRunner,
        resetPasswordDto.token,
      );
      user.password = await this.passwordService.hash(
        resetPasswordDto.password,
      );
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      this.redisService.set(`user:${user.id}`, user);

      return {
        message: await this.i18n.t('user.UPDATE_PASSWORD'),
        data: user,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponse> {
    if (changePasswordDto.password === changePasswordDto.newPassword)
      throw new BadRequestException(
        await this.i18n.t('user.LOGISANE_PASSWORD'),
      );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.validateUserForPasswordChange(
        id,
        changePasswordDto.password,
      );

      user.password = await this.passwordService.hash(
        changePasswordDto.newPassword,
      );
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return {
        message: await this.i18n.t('user.UPDATE_PASSWORD'),
        data: user,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async roleBasedLogin(
    fcmToken: string,
    loginDto: LoginDto,
    role: Role,
  ): Promise<AuthResponse> {
    const { email, password } = loginDto;
    const user = await this.userService.findByEmail(email);

    const validator = new ValidatorComposite();
    validator.add(
      new PasswordValidator(this.i18n, this.passwordService, password),
    );
    validator.add(new RoleValidator(this.i18n, role));
    await validator.validate(user.data);

    const tokenService = await this.tokenFactory.createTokenGenerator();
    const token = await tokenService.generate(user.data.email, user.data.id);

    user.data.fcmToken = fcmToken;
    await this.dataSource.getRepository(User).save(user.data);

    this.redisService.set(`user:${user.data.id}`, user);
    return {
      data: { user: user.data, token },
      message: await this.i18n.t('user.LOGIN'),
    };
  }

  // ====================== Private helper methods =====================

  private async createUser(
    queryRunner: any,
    createUserDto: CreateUserDto,
    avatar?: CreateImagDto,
    address?: CreateAddressInput,
    userAddress?: CreateUserAddressInput,
  ): Promise<User> {
    const password = await this.passwordService.hash(createUserDto.password);
    const user = queryRunner.manager.create(User, {
      ...createUserDto,
      password,
    });

    if (avatar) user.avatar = await this.handleAvatarUpload(avatar);

    await queryRunner.manager.save(user);

    if (address && userAddress) {
      await this.addressService.connectAddressToUser(user.id, address, {
        ...userAddress,
        isDefault: true,
      });
    }

    return user;
  }

  private async handleAvatarUpload(avatar: CreateImagDto): Promise<string> {
    const filename = await this.uploadService.uploadImage(avatar);
    return typeof filename === 'string' ? filename : '';
  }

  private async validateUserForPasswordReset(email: string): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if ([Role.ADMIN].includes(user.data.role))
      throw new BadRequestException(await this.i18n.t('user.NOT_ADMIN'));

    return user.data;
  }

  private async updateUserResetToken(user: User, token: string): Promise<void> {
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await this.dataSource.getRepository(User).save(user);
  }

  private async validateResetToken(
    queryRunner: any,
    token: string,
  ): Promise<User> {
    const user = await queryRunner.manager.findOne(User, {
      where: {
        resetToken: token,
        resetTokenExpiry: MoreThan(new Date()),
      },
    });

    if (!user)
      throw new BadRequestException(await this.i18n.t('user.NOT_FOUND'));
    return user;
  }

  private async validateUserForPasswordChange(
    id: string,
    currentPassword: string,
  ): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user)
      throw new BadRequestException(await this.i18n.t('user.EMAIL_WRONG'));

    const isMatch = await this.passwordService.compare(
      currentPassword,
      user.data.password,
    );
    if (!isMatch)
      throw new BadRequestException(await this.i18n.t('user.OLD_IS_EQUAL_NEW'));

    return user.data;
  }
}
