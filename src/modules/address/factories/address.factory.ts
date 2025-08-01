import { Address } from '../entity/address.entity';
import { CreateAddressInput } from '../inputs/createAddress.dto';
import { UpdateAddressInput } from '../inputs/updateAddress.input';

export class AddressFactory {
  private static strategies = {
    create: (input: CreateAddressInput): Address => {
      const address = new Address();
      Object.assign(address, input);
      return address;
    },
    update: (address: Address, input: UpdateAddressInput): Address => {
      Object.assign(address, input);
      return address;
    },
  };

  static execute(strategy: 'create', input: CreateAddressInput): Address;
  static execute(
    strategy: 'update',
    address: Address,
    input: UpdateAddressInput,
  ): Address;
  static execute(
    strategy: 'create' | 'update',
    ...args: [CreateAddressInput] | [Address, UpdateAddressInput]
  ): Address {
    if (strategy === 'create') {
      return this.strategies.create(args[0] as CreateAddressInput);
    } else if (strategy === 'update') {
      return this.strategies.update(
        args[0] as Address,
        args[1] as UpdateAddressInput,
      );
    }
    throw new Error(`Strategy ${strategy} not found`);
  }
}
