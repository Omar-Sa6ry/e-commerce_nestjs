import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../users/entity/user.entity';
import { AuthResponse } from './dto/AuthRes.dto';
import { CreateUserDto } from './inputs/CreateUserData.dto';
import { LoginDto } from './inputs/Login.dto';
import { ResetPasswordDto } from './inputs/ResetPassword.dto';
import { ChangePasswordDto } from './inputs/ChangePassword.dto';
import { CreateImagDto } from '../../common/upload/dtos/createImage.dto';
import { CurrentUser } from 'src/common/decerator/currentUser.decerator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { Permission, Role } from 'src/common/constant/enum.constant';
import { RedisService } from 'src/common/redis/redis.service';
import { Auth } from 'src/common/decerator/auth.decerator';
import { I18nService } from 'nestjs-i18n';
import { UserResponse } from '../users/dto/UserResponse.dto';
import { CreateAddressInput } from '../address/inputs/createAddress.dto';
import { CreateUserAddressInput } from '../userAdress/inputs/createUserAddress.input';
import { Cart } from '../cart/entities/cart.entity';
import { CartService } from '../cart/cart.service';
import { AuthServiceFacade } from './fascade/AuthService.facade';

@Resolver(() => User)
export class AuthResolver {
  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly authFacade: AuthServiceFacade,
  ) {}

  @Mutation(() => AuthResponse)
  async register(
    @Args('createUserDto') createUserDto: CreateUserDto,
    @Args('userAddress', { nullable: true })
    userAddress?: CreateUserAddressInput,
    @Args('address', { nullable: true }) address?: CreateAddressInput,
    @Args('avatar', { nullable: true }) avatar?: CreateImagDto,
  ): Promise<AuthResponse> {
    return this.authFacade.register(
      createUserDto,
      avatar,
      address,
      userAddress,
    );
  }

  @Mutation(() => AuthResponse)
  async login(@Args('loginDto') loginDto: LoginDto): Promise<AuthResponse> {
    const userCacheKey = `auth:${loginDto.email}`;
    const cachedUser = await this.redisService.get(userCacheKey);

    if (cachedUser instanceof AuthResponse) {
      return { ...cachedUser };
    }

    return this.authFacade.login(loginDto);
  }

  @Mutation(() => AuthResponse)
  @Auth([Role.USER], [Permission.FORGOT_PASSWORD])
  async forgotPassword(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<AuthResponse> {
    return this.authService.forgotPassword(user.email);
  }

  @Mutation(() => UserResponse)
  @Auth([Role.USER], [Permission.RESET_PASSWORD])
  async resetPassword(
    @Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto,
  ): Promise<UserResponse> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Mutation(() => UserResponse)
  @Auth([Role.USER], [Permission.CHANGE_PASSWORD])
  async changePassword(
    @CurrentUser() user: CurrentUserDto,
    @Args('changePasswordDto') changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponse> {
    return this.authService.changePassword(user?.id, changePasswordDto);
  }

  @Mutation(() => Boolean)
  @Auth([Role.ADMIN], [Permission.LOGOUT])
  async logout(@Context('req') req): Promise<boolean> {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) throw new Error(await this.i18n.t('user.NO_TOKEN'));

    return true;
  }

  @ResolveField(() => Cart || [])
  async userAddresses(@Parent() user: User): Promise<Cart | []> {
    return this.cartService.getUserCartWithItemsForUser(user.id);
  }
}
