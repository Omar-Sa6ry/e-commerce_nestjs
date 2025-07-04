import { Address } from '../entity/address.entity';
import { CreateAddressInput } from '../inputs/createAddress.dto';
import { UpdateAddressInput } from '../inputs/updateAddress.input';

export class AddressFactory {
  static create(input: CreateAddressInput): Address {
    const address = new Address();
    Object.assign(address, input);
    return address;
  }

  static update(address: Address, input: UpdateAddressInput): Address {
    Object.assign(address, input);

    return address;
  }
}
