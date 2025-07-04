import { Injectable } from '@nestjs/common';
import { UserAddress } from '../entity/userAddress.entity';
import { CreateUserAddressInput } from '../inputs/createUserAddress.input';
import { Address } from 'src/modules/address/entity/address.entity';

@Injectable()
export class UserAddressFactory {
  static create(
    input: CreateUserAddressInput,
    userId: string,
    address: Address,
    forceDefault: boolean = false,
  ): UserAddress {
    const userAddress = new UserAddress();

    userAddress.userId = userId;
    userAddress.addressId = address.id;
    userAddress.address = address;
    userAddress.isDefault = forceDefault || input.isDefault || false;

    return userAddress;
  }
}
