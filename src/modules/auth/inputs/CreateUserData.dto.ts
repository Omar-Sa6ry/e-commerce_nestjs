import { Field, InputType } from '@nestjs/graphql';
import { PasswordValidator } from 'src/common/constant/messages.constant';
import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  Length,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsEmailConstraint } from 'src/common/constant/validEmail';
import { CapitalizeWords } from 'src/common/constant/CapitalizeWords';

@InputType()
export class CreateUserDto {
  @Field()
  @IsString()
  @Transform(({ value }) => CapitalizeWords(value))
  firstName: string;

  @Field()
  @IsString()
  @Transform(({ value }) => CapitalizeWords(value))
  lastName: string;

  @Field()
  @IsEmail()
  @Validate(IsEmailConstraint)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @Field()
  @IsString()
  @Length(8, 16, { message: PasswordValidator })
  password: string;

  @Field()
  @IsPhoneNumber('EG')
  phone: string;
}
