import { UserAction } from './constant/user.constant';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { User } from './entity/user.entity';
import { UpdateUserDto } from './inputs/UpdateUser.dto';
import { Permission, Role } from 'src/common/constant/enum.constant';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { CurrentUser } from 'src/common/decerator/currentUser.decerator';
import { Auth } from 'src/common/decerator/auth.decerator';
import { UserResponse } from './dto/UserResponse.dto';
import { EmailInput, UserIdInput } from './inputs/user.input';
import { Cart } from '../cart/entities/cart.entity';
import { CartService } from '../cart/cart.service';
import { UserFacadeService } from './fascade/user.fascade';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly cartService: CartService,
    private readonly userFacade: UserFacadeService,
  ) {}

  @Query((returns) => UserResponse)
  async getUserById(@Args('id') id: UserIdInput): Promise<UserResponse> {
    return await this.userFacade.manageUser(
      'findById' as UserAction,
      id.UserId,
    );
  }

  @Query((returns) => UserResponse)
  async getUserByEmail(
    @Args('email') email: EmailInput,
  ): Promise<UserResponse> {
    return await this.userFacade.manageUser(
      'findByEmail' as UserAction,
      email.email,
    );
  }

  @Mutation((returns) => UserResponse)
  @Auth([Role.ADMIN, Role.USER], [Permission.UPDATE_USER])
  async updateUser(
    @CurrentUser() user: CurrentUserDto,
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.userFacade.manageUser(
      'update' as UserAction,
      updateUserDto,
      user.id,
    );
  }

  @Query((returns) => UserResponse)
  @Auth([Role.ADMIN], [Permission.DELETE_USER])
  async deleteUser(@CurrentUser() user: CurrentUserDto): Promise<UserResponse> {
    return await this.userFacade.manageUser('delete' as UserAction, user.id);
  }

  @Mutation((returns) => String)
  @Auth([Role.ADMIN], [Permission.EDIT_USER_ROLE])
  async UpdateUserRole(
    @Args('email') email: EmailInput,
  ): Promise<UserResponse> {
    return await this.userFacade.manageUser(
      'editRole' as UserAction,
      email.email,
    );
  }

  @ResolveField(() => Cart || [])
  async userAddresses(@Parent() user: User): Promise<Cart | []> {
    return this.cartService.getUserCartWithItemsForUser(user.id);
  }
}
