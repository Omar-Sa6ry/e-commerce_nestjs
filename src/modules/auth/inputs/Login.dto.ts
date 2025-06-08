import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, Validate } from 'class-validator';
import { IsEmailConstraint } from 'src/common/constant/validEmail';

@InputType()
export class LoginDto {
  @Field()
  @IsEmail()
  @Validate(IsEmailConstraint)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @Field()
  password: string;
}
