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

@InputType()
export class CreateUserDto {
  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
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
