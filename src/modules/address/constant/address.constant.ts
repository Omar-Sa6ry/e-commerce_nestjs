import { CreateAddressInput } from '../inputs/createAddress.dto';
import { UpdateAddressInput } from '../inputs/updateAddress.input';

export enum AddressAction {
  CREATE = 'create',
  UPDATE = 'update',
  GET_BY_ID = 'getById',
  DELETE = 'delete',
  GET_USER_ADDRESSES = 'getUserAddresses',
}

export type AddressDataFascade =
  | CreateAddressInput
  | UpdateAddressInput
  | string;
