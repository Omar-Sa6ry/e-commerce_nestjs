import {
  Resolver,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UserAddress } from './entity/userAddress.entity';
import { UserAddressService } from './userAddress.service';
import { UserAddressResponse } from './dto/userAddressResponse.dto';
import { Permission, Role } from 'src/common/constant/enum.constant';
import { Auth } from 'src/common/decerator/auth.decerator';
import { CurrentUser } from 'src/common/decerator/currentUser.decerator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { CreateUserAddressInput } from './inputs/createUserAddress.input';
import { UpdateUserAddressInput } from './inputs/updateUserAddress.input';
import { Address } from '../address/entity/address.entity';
import { User } from '../users/entity/user.entity';
import { UpdateAddressInput } from '../address/inputs/updateAddress.input';

@Resolver(() => UserAddress)
export class UserAddressResolver {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Mutation(() => UserAddressResponse)
  @Auth([Role.USER], [Permission.CREATE_USER_ADDRESS])
  async createUserAddress(
    @CurrentUser() user: CurrentUserDto,
    @Args('createUserAddressInput')
    createUserAddressInput: CreateUserAddressInput,
  ): Promise<UserAddressResponse> {
    return this.userAddressService.createUserAddress(
      user.id,
      createUserAddressInput,
    );
  }

  @Mutation(() => UserAddressResponse)
  @Auth([Role.USER], [Permission.UPDATE_USER_ADDRESS])
  async updateUserAddress(
    @CurrentUser() user: CurrentUserDto,
    @Args('addressId') addressId: string,
    @Args('updateAddressInput', { nullable: true })
    updateAddressInput?: UpdateAddressInput,
    @Args('updateUserAddressInput', { nullable: true })
    updateUserAddressInput?: UpdateUserAddressInput,
  ): Promise<UserAddressResponse> {
    return this.userAddressService.updateUserAddress(
      user.id,
      addressId,
      updateAddressInput,
      updateUserAddressInput,
    );
  }

  @Mutation(() => UserAddressResponse)
  @Auth([Role.USER], [Permission.DELETE_USER_ADDRESS])
  async deleteUserAddress(
    @CurrentUser() user: CurrentUserDto,
    @Args('userAddressId') userAddressId: string,
  ): Promise<UserAddressResponse> {
    return this.userAddressService.deleteUserAddress(user.id, userAddressId);
  }

  @Mutation(() => UserAddressResponse)
  @Auth([Role.USER], [Permission.UPDATE_USER_ADDRESS])
  async setDefaultAddress(
    @CurrentUser() user: CurrentUserDto,
    @Args('userAddressId') userAddressId: string,
  ): Promise<UserAddressResponse> {
    return this.userAddressService.setDefaultAddress(user.id, userAddressId);
  }

  @ResolveField(() => Address)
  async address(@Parent() userAddress: UserAddress): Promise<Address> {
    return this.userAddressService.getAddressByUserAddressId(userAddress.id);
  }

  @ResolveField(() => User)
  async user(@Parent() userAddress: UserAddress): Promise<User> {
    return this.userAddressService.getUserByUserAddressId(userAddress.id);
  }
}
