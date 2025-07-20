import { Injectable } from '@nestjs/common';
import { AddressResponse } from '../dto/addressResponse.dto';
import { AddressService } from '../address.service';
import { CreateAddressInput } from '../inputs/createAddress.dto';
import { UpdateAddressInput } from '../inputs/updateAddress.input';
import {
  AddressAction,
  AddressDataFascade,
} from '../constant/address.constant';

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
    }
  }
}
