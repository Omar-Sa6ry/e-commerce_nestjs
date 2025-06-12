import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { AddressService } from './address.service';
import { Address } from './entity/address.entity';
import { AddressResponse } from './dto/addressResponse.dto';
import { Auth } from 'src/common/decerator/auth.decerator';
import { Permission, Role } from 'src/common/constant/enum.constant';
import { CreateAddressInput } from './inputs/createAddress.dto';
import { UpdateAddressInput } from './inputs/updateAddress.input';
import { UserAddress } from '../userAdress/entity/userAddress.entity';

@Resolver(() => Address)
export class AddressResolver {
  constructor(private readonly addressService: AddressService) {}

  @Mutation(() => AddressResponse)
  @Auth([Role.USER], [Permission.CREATE_ADDRESS])
  async createAddress(
    @Args('createAddressInput') createAddressInput: CreateAddressInput,
  ): Promise<AddressResponse> {
    return this.addressService.createAddress(createAddressInput);
  }

  @Query(() => AddressResponse)
  @Auth([Role.USER], [Permission.VIEW_ADDRESS])
  async getAddress(
    @Args('addressId') addressId: string,
  ): Promise<AddressResponse> {
    return this.addressService.getAddressById(addressId);
  }

  @Mutation(() => AddressResponse)
  @Auth([Role.USER], [Permission.UPDATE_ADDRESS])
  async updateAddress(
    @Args('addressId') addressId: string,
    @Args('updateAddressInput') updateAddressInput: UpdateAddressInput,
  ): Promise<AddressResponse> {
    return this.addressService.updateAddress(addressId, updateAddressInput);
  }

  @Mutation(() => AddressResponse)
  @Auth([Role.USER], [Permission.DELETE_ADDRESS])
  async deleteAddress(
    @Args('addressId') addressId: string,
  ): Promise<AddressResponse> {
    return this.addressService.deleteAddress(addressId);
  }

  @ResolveField(() => [UserAddress])
  async userAddresses(@Parent() address: Address): Promise<UserAddress[]> {
    return this.addressService.getUserAddressesByAddressId(address.id);
  }
}
