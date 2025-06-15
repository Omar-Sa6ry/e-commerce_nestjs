import { Field, InputType } from '@nestjs/graphql';
import { PasswordField } from 'src/common/decerator/validation/PasswordField.decerator';

@InputType()
export class ResetPasswordDto {
  @Field()
  token: string;

  @PasswordField()
  password: string;
}
