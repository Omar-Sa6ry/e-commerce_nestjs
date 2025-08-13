import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Address } from './entity/address.entity';
import { AddressResponse } from './dto/addressResponse.dto';
import { Auth } from 'src/common/decorator/auth.decorator';
import { Permission, Role } from 'src/common/constant/enum.constant';
import { CreateAddressInput } from './inputs/createAddress.dto';
import { UpdateAddressInput } from './inputs/updateAddress.input';
import { UserAddress } from '../userAdress/entity/userAddress.entity';
import { AddressIdInput } from './inputs/addressId.input';
import { AddressAction } from './constant/address.constant';
import { AddressFacadeService } from './fascade/address.fascade';
import { AddressService } from './address.service';

@Resolver(() => Address)
export class AddressResolver {
  constructor(
    private readonly addressService: AddressService,
    private readonly addressFacadeService: AddressFacadeService,
  ) {}

  @Mutation(() => AddressResponse)
  @Auth([Role.USER], [Permission.CREATE_ADDRESS])
  async createAddress(
    @Args('createAddressInput') createAddressInput: CreateAddressInput,
  ): Promise<AddressResponse> {
    return this.addressFacadeService.manageAddress(
      AddressAction.CREATE,
      createAddressInput,
    );
  }

  @Query(() => AddressResponse)
  @Auth([Role.USER], [Permission.VIEW_ADDRESS])
  async getAddress(
    @Args('addressId') addressId: AddressIdInput,
  ): Promise<AddressResponse> {
    return this.addressFacadeService.manageAddress(
      AddressAction.GET_BY_ID,
      addressId.addressId,
    );
  }

  @Mutation(() => AddressResponse)
  @Auth([Role.USER], [Permission.UPDATE_ADDRESS])
  async updateAddress(
    @Args('addressId') addressId: AddressIdInput,
    @Args('updateAddressInput') updateAddressInput: UpdateAddressInput,
  ): Promise<AddressResponse> {
    return this.addressService.updateAddress(
      addressId.addressId,
      updateAddressInput,
    );
  }

  @Mutation(() => AddressResponse)
  @Auth([Role.USER], [Permission.DELETE_ADDRESS])
  async deleteAddress(
    @Args('addressId') addressId: AddressIdInput,
  ): Promise<AddressResponse> {
    return this.addressFacadeService.manageAddress(
      AddressAction.DELETE,
      addressId.addressId,
    );
  }

  @ResolveField(() => [UserAddress])
  async userAddresses(@Parent() address: Address): Promise<UserAddress[]> {
    return this.addressService.getUserAddressesByAddressId(address.id);
  }
}
