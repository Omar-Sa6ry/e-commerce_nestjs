import { InputType } from '@nestjs/graphql';
import { EmailField } from 'src/common/decerator/validation/EmailField.decerator';
import { PasswordField } from 'src/common/decerator/validation/PasswordField.decerator';
import { TextField } from 'src/common/decerator/validation/TextField.decerator';

@InputType()
export class LoginDto {
  @EmailField()
  email: string;

  @PasswordField()
  password: string;

  @TextField('fcmToken')
  fcmToken: string;
}
