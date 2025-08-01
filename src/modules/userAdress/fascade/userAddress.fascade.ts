import { BadRequestException, Injectable } from '@nestjs/common';
import { UserAddressResponse } from '../dto/userAddressResponse.dto';
import { CreateUserAddressInput } from '../inputs/createUserAddress.input';
import { UpdateUserAddressInput } from '../inputs/updateUserAddress.input';
import { UpdateAddressInput } from '../../address/inputs/updateAddress.input';
import { UserAddressService } from '../userAddress.service';
import { UserAddressAction } from '../constant/userAddress.constant';
import { UpdateUserAddressCommand } from '../commands/updateUserAddress.command';
import { CreateUserAddressCommand } from '../commands/createUserAddress.command';

@Injectable()
export class UserAddressFacadeService {
  constructor(private readonly userAddressService: UserAddressService) {}

  async manageUserAddress(
    action: UserAddressAction,
    input: any,
    userId?: string,
    addressId?: string,
  ): Promise<UserAddressResponse> {
    switch (action) {
      case 'create':
        const createCommand = new CreateUserAddressCommand(
          this.userAddressService,
          userId!,
          input as CreateUserAddressInput,
        );
        return createCommand.execute();


      case 'update':
        if (typeof input === 'string') {
          throw new BadRequestException('Invalid input for update operation');
        }

        const updateCommand = new UpdateUserAddressCommand(
          this.userAddressService,
          userId!,
          addressId!,
          'isDefault' in input ? undefined : (input as UpdateAddressInput),
          'isDefault' in input ? (input as UpdateUserAddressInput) : undefined,
        );
        return updateCommand.execute();

      case 'getById':
        return this.userAddressService.getById(input as string);

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
