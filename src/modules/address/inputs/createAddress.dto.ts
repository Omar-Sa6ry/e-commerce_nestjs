import { AddressType } from 'src/common/constant/enum.constant';
import { LowwerWords } from 'src/common/constant/WordsTransform';
import { Transform } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsEnum, IsOptional, Length } from 'class-validator';

@InputType()
export class CreateAddressInput {
  @Field()
  @IsString()
  locationId: string;

  @Field()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => LowwerWords(value))
  street: string;

  @Field(() => AddressType, { nullable: true })
  @IsEnum(AddressType)
  @IsOptional()
  addressType?: AddressType;
}
