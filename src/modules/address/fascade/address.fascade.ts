import { Injectable } from '@nestjs/common';
import { AddressResponse } from '../dto/addressResponse.dto';
import { AddressService } from '../address.service';
import { CreateAddressInput } from '../inputs/createAddress.dto';
import { UpdateAddressInput } from '../inputs/updateAddress.input';
import {
  AddressAction,
  AddressDataFascade,
} from '../constant/address.constant';

type CommandMap = {
  [AddressAction.CREATE]: CreateAddressInput;
  [AddressAction.GET_BY_ID]: string;
  [AddressAction.DELETE]: string;
  [AddressAction.UPDATE]: UpdateAddressInput & { id: string };
  [AddressAction.GET_USER_ADDRESSES]: string; // Add other actions here
};
@Injectable()
export class AddressFacadeService {
  constructor(private readonly addressService: AddressService) {}

  async manageAddress(
    action: AddressAction,
    data: AddressDataFascade,
    id?: string,
  ): Promise<AddressResponse> {
    switch (action) {
      case AddressAction.CREATE:
        return this.addressService.createAddress(data as CreateAddressInput);
      case AddressAction.GET_BY_ID:
        return this.addressService.getAddressById(data as string);
      case AddressAction.DELETE:
        return this.addressService.deleteAddress(data as string);
      case AddressAction.UPDATE:
        if (!id) throw new Error('ID is required for update');
        return this.addressService.updateAddress(
          id,
          data as UpdateAddressInput,
        );
      case AddressAction.GET_USER_ADDRESSES:
      // return this.addressService
      //   .getUserAddressesByAddressId(data as string)
      //   .then((addresses) => ({
      //     data: addresses,
      //     message: 'User addresses retrieved successfully',
      //   }));
      default:
        throw new Error(`Unsupported address action: ${action}`);
    }
  }
}
