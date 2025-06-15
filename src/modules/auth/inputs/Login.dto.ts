import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { EmailField } from 'src/common/decerator/validation/EmailField.decerator';
import { PasswordField } from 'src/common/decerator/validation/PasswordField.decerator';

@InputType()
export class LoginDto {
  @EmailField()
  email: string;

  @PasswordField()
  password: string;

  @Field()
  @IsString()
  fcmToken: string;
}
