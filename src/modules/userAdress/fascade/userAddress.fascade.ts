import { BadRequestException, Injectable } from '@nestjs/common';
import { UserAddressResponse } from '../dto/userAddressResponse.dto';
import { CreateUserAddressInput } from '../inputs/createUserAddress.input';
import { UpdateUserAddressInput } from '../inputs/updateUserAddress.input';
import { UpdateAddressInput } from '../../address/inputs/updateAddress.input';
import { UserAddressService } from '../userAddress.service';
import {
  UserAddressAction,
  UserAddressInput,
} from '../constant/userAddress.constant';

@Injectable()
export class UserAddressFacadeService {
  constructor(private readonly userAddressService: UserAddressService) {}

  async manageUserAddress(
    action: UserAddressAction,
    input: UserAddressInput,
    userId?: string,
    addressId?: string,
  ): Promise<UserAddressResponse> {
    switch (action) {
      case 'create':
        return this.userAddressService.createUserAddress(
          userId!,
          input as CreateUserAddressInput,
        );
      case 'getById':
        return this.userAddressService.getById(input as string);
      case 'update':
        if (typeof input === 'string' || input instanceof String) {
          throw new BadRequestException('Invalid input for update operation');
        }

        if ('isDefault' in input) {
          // This is UpdateUserAddressInput
          return this.userAddressService.updateUserAddress(
            userId!,
            addressId!,
            undefined,
            input as UpdateUserAddressInput,
          );
        } else {
          // This is UpdateAddressInput
          return this.userAddressService.updateUserAddress(
            userId!,
            addressId!,
            input as UpdateAddressInput,
          );
        }
      case 'delete':
        return this.userAddressService.deleteUserAddress(
          userId!,
          input as string,
        );
      case 'setDefault':
        return this.userAddressService.setDefaultAddress(
          userId!,
          input as string,
        );
      case 'getDefault':
        return {
          data: await this.userAddressService.getUserDefaultAddress(userId!),
        };
      default:
        throw new BadRequestException('Invalid user address action');
    }
  }
}
