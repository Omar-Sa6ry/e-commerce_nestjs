import { Address } from "src/modules/address/entity/address.entity";

export interface IAddressStrategy {
  execute(input: any, existingAddress?: Address): Promise<Address>;
}
