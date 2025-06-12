import { InputType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmailConstraint } from 'src/common/constant/validEmail';
import { CapitalizeWords } from 'src/common/constant/WordsTransform';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Validate,
} from 'class-validator';

@InputType()
export class CreateCompanyDto {
  @Field()
  @IsString()
  @Transform(({ value }) => CapitalizeWords(value))
  name: string;

  @Field()
  @IsEmail()
  @Validate(IsEmailConstraint)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @Field()
  @IsPhoneNumber('EG')
  phone: string;

  @Field()
  @IsOptional()
  website: string;
}
