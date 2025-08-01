import { UserAddressResponse } from "../dto/userAddressResponse.dto";

export interface UserAddressCommand {
  execute(): Promise<UserAddressResponse>;
}
