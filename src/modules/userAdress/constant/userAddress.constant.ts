import { UpdateAddressInput } from "src/modules/address/inputs/updateAddress.input";
import { CreateUserAddressInput } from "../inputs/createUserAddress.input";
import { UpdateUserAddressInput } from "../inputs/updateUserAddress.input";

export type UserAddressInput =
  | CreateUserAddressInput
  | UpdateUserAddressInput
  | UpdateAddressInput
  | string;

export type UserAddressAction =
  | 'create'
  | 'getById'
  | 'update'
  | 'delete'
  | 'setDefault'
  | 'getDefault';