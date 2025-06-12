import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateAddressInput } from 'src/modules/address/inputs/createAddress.dto';

@InputType()
export class CreateUserAddressInput {
  @Field(() => CreateAddressInput)
  createAddress: CreateAddressInput;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
