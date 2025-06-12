import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateUserAddressInput } from './createUserAddress.input';

@InputType()
export class UpdateUserAddressInput extends PartialType(
  CreateUserAddressInput,
) {}
