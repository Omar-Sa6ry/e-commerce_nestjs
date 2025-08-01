import { CreateUserAddressInput } from '../inputs/createUserAddress.input';
import { UserAddressService } from '../userAddress.service';
import { UserAddressResponse } from '../dto/userAddressResponse.dto';
import { UserAddressCommand } from '../interfaces/IUserAddressCommand.interface';

export class CreateUserAddressCommand implements UserAddressCommand {
  constructor(
    private readonly service: UserAddressService,
    private readonly userId: string,
    private readonly input: CreateUserAddressInput,
  ) {}

  async execute(): Promise<UserAddressResponse> {
    return this.service.createUserAddress(this.userId, this.input);
  }
}
