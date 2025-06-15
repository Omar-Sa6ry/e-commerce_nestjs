import { AddressType } from 'src/common/constant/enum.constant';
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';
import { TextField } from 'src/common/decerator/validation/TextField.decerator';

@InputType()
export class CreateAddressInput {
  @IdField('Location')
  locationId: string;

  @TextField('Street name', 255)
  street: string;

  @Field(() => AddressType, { nullable: true })
  @IsEnum(AddressType)
  @IsOptional()
  addressType?: AddressType;
}
