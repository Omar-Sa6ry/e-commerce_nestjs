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
import { Auth } from 'src/common/decorator/auth.decorator';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { CreateUserAddressInput } from './inputs/createUserAddress.input';
import { UpdateUserAddressInput } from './inputs/updateUserAddress.input';
import { Address } from '../address/entity/address.entity';
import { User } from '../users/entity/user.entity';
import { UpdateAddressInput } from '../address/inputs/updateAddress.input';
import { AddressIdInput } from '../address/inputs/addressId.input';
import { UserAddressFacadeService } from './fascade/userAddress.fascade';
import { BadRequestException } from '@nestjs/common';
import {
  UserAddressAction,
  UserAddressInput,
} from './constant/userAddress.constant';

@Resolver(() => UserAddress)
export class UserAddressResolver {
  constructor(
    private readonly userAddressService: UserAddressService,
    private readonly userAddressFascade: UserAddressFacadeService,
  ) {}

  @Mutation(() => UserAddressResponse)
  @Auth([Role.USER], [Permission.CREATE_USER_ADDRESS])
  async createUserAddress(
    @CurrentUser() user: CurrentUserDto,
    @Args('createUserAddressInput')
    createUserAddressInput: CreateUserAddressInput,
  ): Promise<UserAddressResponse> {
    return this.userAddressFascade.manageUserAddress(
      'create' as UserAddressAction,
      createUserAddressInput as UserAddressInput,
      user.id,
    );
  }

  @Mutation(() => UserAddressResponse)
  @Auth([Role.USER], [Permission.UPDATE_USER_ADDRESS])
  async updateUserAddress(
    @CurrentUser() user: CurrentUserDto,
    @Args('addressId') addressId: AddressIdInput,
    @Args('updateAddressInput', { nullable: true })
    updateAddressInput?: UpdateAddressInput,
    @Args('updateUserAddressInput', { nullable: true })
    updateUserAddressInput?: UpdateUserAddressInput,
  ): Promise<UserAddressResponse> {
    const input = updateUserAddressInput || updateAddressInput;
    if (!input) {
      throw new BadRequestException('No update data provided');
    }

    return this.userAddressFascade.manageUserAddress(
      'update',
      input,
      user.id,
      addressId.addressId,
    );
  }

  @Mutation(() => UserAddressResponse)
  @Auth([Role.USER], [Permission.DELETE_USER_ADDRESS])
  async deleteUserAddress(
    @CurrentUser() user: CurrentUserDto,
    @Args('userAddressId') userAddressId: AddressIdInput,
  ): Promise<UserAddressResponse> {
    return this.userAddressFascade.manageUserAddress(
      'delete' as UserAddressAction,
      user.id,
      userAddressId.addressId,
    );
  }

  @Mutation(() => UserAddressResponse)
  @Auth([Role.USER], [Permission.UPDATE_USER_ADDRESS])
  async setDefaultAddress(
    @CurrentUser() user: CurrentUserDto,
    @Args('userAddressId') userAddressId: AddressIdInput,
  ): Promise<UserAddressResponse> {
    return this.userAddressFascade.manageUserAddress(
      'setDefault' as UserAddressAction,
      user.id,
      userAddressId.addressId,
    );
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
