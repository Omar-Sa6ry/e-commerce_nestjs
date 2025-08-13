import { InputType } from '@nestjs/graphql';
import { PasswordField } from 'src/common/decorator/validation/PasswordField.decorator';

@InputType()
export class ChangePasswordDto {
  @PasswordField()
  password: string;

  @PasswordField()
  newPassword: string;
}
