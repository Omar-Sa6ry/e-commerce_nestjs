import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { EmailField } from 'src/common/decorator/validation/EmailField.decorator';
import { PasswordField } from 'src/common/decorator/validation/PasswordField.decorator';

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
