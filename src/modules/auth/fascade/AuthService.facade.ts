import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { RedisService } from 'src/common/redis/redis.service';
import { UserService } from 'src/modules/users/users.service';
import { GenerateTokenFactory } from '../jwt/jwt.service';
import { User } from 'src/modules/users/entity/user.entity';
import { AuthResponse } from '../dto/AuthRes.dto';
import { LoginDto } from '../inputs/Login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserAddressInput } from 'src/modules/userAdress/inputs/createUserAddress.input';
import { CreateUserDto } from '../inputs/CreateUserData.dto';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { CreateAddressInput } from 'src/modules/address/inputs/createAddress.dto';
import { Transactional } from 'src/common/decorator/transactional.decorator';
import { SendWelcomeEmailCommand } from '../command/auth.command';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { UploadService } from 'src/common/upload/upload.service';
import { UserAddressService } from 'src/modules/userAdress/userAddress.service';
import { Role } from 'src/common/constant/enum.constant';
import { PasswordValidator, RoleValidator } from '../chain/auth.chain';
import { PasswordServiceAdapter } from '../adapter/password.adapter';

@Injectable()
export class AuthServiceFacade {
  constructor(
    private readonly i18n: I18nService,
    private readonly userService: UserService,
    private readonly tokenFactory: GenerateTokenFactory,
    private readonly passwordStrategy: PasswordServiceAdapter,
    private readonly addressService: UserAddressService,
    private readonly redisService: RedisService,
    private readonly uploadService: UploadService,
    private readonly emailService: SendEmailService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @Transactional()
  async register(
    createUserDto: CreateUserDto,
    avatar?: CreateImagDto,
    address?: CreateAddressInput,
    userAddress?: CreateUserAddressInput,
  ): Promise<AuthResponse> {
    const user = await this.createUser(
      createUserDto,
      avatar,
      address,
      userAddress,
    );

    const tokenService = await this.tokenFactory.createTokenGenerator();
    const token = await tokenService.generate(user.email, user.id);

    this.redisService.set(`user:${user.id}`, user);

    const emailCommand = new SendWelcomeEmailCommand(
      this.emailService,
      user.email,
    );
    emailCommand.execute();

    return {
      data: {
        user,
        token,
      },
    };
  }
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password, fcmToken } = loginDto;
    const user = await this.userService.findByEmail(email);
    if (!user)
      throw new BadRequestException(await this.i18n.t('user.NOT_FOUND'));

    const isValid = await this.passwordStrategy.compare(
      password,
      user.data.password,
    );
    if (!isValid) throw new BadRequestException('Invalid credentials');

    const tokenGenerator = await this.tokenFactory.createTokenGenerator();
    const token = await tokenGenerator.generate(user.data.email, user.data.id);

    user.data.fcmToken = fcmToken;
    this.userRepo.save(user.data);

    this.redisService.set(`user:${user.data.id}`, user);
    return {
      data: { user: user.data, token },
      message: await this.i18n.t('user.LOGIN'),
    };
  }

  async roleBasedLogin(
    fcmToken: string,
    loginDto: LoginDto,
    role: Role,
  ): Promise<AuthResponse> {
    const { email, password } = loginDto;
    const user = await this.userService.findByEmail(email);

    const passwordValidator = new PasswordValidator(
      this.i18n,
      this.passwordStrategy,
      password,
    );
    const roleValidator = new RoleValidator(this.i18n, role);

    passwordValidator.setNext(roleValidator);
    await passwordValidator.validate(user.data);

    const tokenService = await this.tokenFactory.createTokenGenerator();
    const token = await tokenService.generate(user.data.email, user.data.id);

    user.data.fcmToken = fcmToken;
    await this.userRepo.save(user.data);

    this.redisService.set(`user:${user.data.id}`, user);
    return {
      data: { user: user.data, token },
      message: await this.i18n.t('user.LOGIN'),
    };
  }

  private async createUser(
    createUserDto: CreateUserDto,
    avatar?: CreateImagDto,
    address?: CreateAddressInput,
    userAddress?: CreateUserAddressInput,
  ): Promise<User> {
    const ifEmailExisted = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (ifEmailExisted)
      throw new BadRequestException(await this.i18n.t('user.EMAIL_EXISTED'));

    const password = await this.passwordStrategy.hash(createUserDto.password);

    const user = await this.userRepo.save({ ...createUserDto, password });

    if (avatar) user.avatar = await this.handleAvatarUpload(avatar);
    await this.userRepo.save({ ...createUserDto, password });

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
}
