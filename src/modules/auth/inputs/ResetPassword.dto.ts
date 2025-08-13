import { Field, InputType } from '@nestjs/graphql';
import { PasswordField } from 'src/common/decorator/validation/PasswordField.decorator';

@InputType()
export class ResetPasswordDto {
  @Field()
  token: string;

  @PasswordField()
  password: string;
}
