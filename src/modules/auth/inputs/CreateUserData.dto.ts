import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { EmailField } from 'src/common/decerator/validation/EmailField.decerator';
import { PasswordField } from 'src/common/decerator/validation/PasswordField.decerator';
import { PhoneField } from 'src/common/decerator/validation/PhoneField.decerator';

@InputType()
export class CreateUserDto {
  @Field()
  @IsString()
  fcmToken: string;

  @CapitalTextField('First name')
  firstName: string;

  @CapitalTextField('Last name')
  lastName: string;

  @EmailField()
  email: string;

  @PasswordField()
  password: string;

  @PhoneField()
  phone: string;
}
