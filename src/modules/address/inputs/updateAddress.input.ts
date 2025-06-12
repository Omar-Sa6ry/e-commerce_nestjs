import { InputType, PartialType } from '@nestjs/graphql';
import { CreateAddressInput } from './createAddress.dto';

@InputType()
export class UpdateAddressInput extends PartialType(CreateAddressInput) {}
