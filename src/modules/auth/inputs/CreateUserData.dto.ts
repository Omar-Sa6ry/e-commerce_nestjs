import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { EmailField } from 'src/common/decorator/validation/EmailField.decorator';
import { PasswordField } from 'src/common/decorator/validation/PasswordField.decorator';
import { PhoneField } from 'src/common/decorator/validation/PhoneField.decorator';

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
