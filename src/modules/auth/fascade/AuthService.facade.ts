import { I18nService } from "nestjs-i18n";
import { UserService } from "src/modules/users/users.service";
import { GenerateTokenFactory } from "../jwt/jwt.service";
import { RedisService } from "src/common/redis/redis.service";
import { PasswordServiceAdapter } from "../utils/IPasswordService";
import { BadRequestException } from "@nestjs/common";
import { User } from "src/modules/users/entity/user.entity";

export class AuthServiceFacade {
  constructor(
    private readonly i18n: I18nService,
    private readonly userService: UserService,
    private readonly tokenFactory: GenerateTokenFactory,
    private readonly passwordService: PasswordServiceAdapter,
    private readonly redisService: RedisService,
  ) {}

  async authenticate(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user)
      throw new BadRequestException(await this.i18n.t('user.NOT_FOUND'));

    const isValid = await this.passwordService.compare(
      password,
      user.data.password,
    );
    if (!isValid) throw new BadRequestException('Invalid credentials');

    const tokenGenerator = await this.tokenFactory.createTokenGenerator();
    const token = await tokenGenerator.generate(user.data.email, user.data.id);

    this.redisService.set(`user:${user.data.id}`, user);
    return { user: user.data, token };
  }
}