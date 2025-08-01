import { UserAddressCommand } from "../interfaces/IUserAddressCommand.interface";
import { UserAddressService } from "../userAddress.service";
import { UpdateAddressInput } from "src/modules/address/inputs/updateAddress.input";
import { UpdateUserAddressInput } from "../inputs/updateUserAddress.input";
import { UserAddressResponse } from "../dto/userAddressResponse.dto";


export class UpdateUserAddressCommand implements UserAddressCommand {
  constructor(
    private readonly service: UserAddressService,
    private readonly userId: string,
    private readonly addressId: string,
    private readonly addressInput?: UpdateAddressInput,
    private readonly userAddressInput?: UpdateUserAddressInput,
  ) {}

  async execute(): Promise<UserAddressResponse> {
    return this.service.updateUserAddress(
      this.userId,
      this.addressId,
      this.addressInput,
      this.userAddressInput,
    );
  }
}
