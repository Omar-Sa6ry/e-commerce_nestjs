import { UserAddress } from "../entity/userAddress.entity";

export interface IAddressObserver {
  update(address: UserAddress): Promise<void>;
}
