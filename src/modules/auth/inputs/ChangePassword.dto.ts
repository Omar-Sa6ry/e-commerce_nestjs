import { InputType } from '@nestjs/graphql';
import { PasswordField } from 'src/common/decerator/validation/PasswordField.decerator';

@InputType()
export class ChangePasswordDto {
  @PasswordField()
  password: string;

  @PasswordField()
  newPassword: string;
}
