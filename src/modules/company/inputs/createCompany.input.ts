import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { EmailField } from 'src/common/decorator/validation/EmailField.decorator';
import { PhoneField } from 'src/common/decorator/validation/PhoneField.decorator';
import { TextField } from 'src/common/decorator/validation/TextField.decorator';

@InputType()
export class CreateCompanyDto {
  @CapitalTextField('Name', 100)
  name: string;

  @EmailField()
  email: string;

  @PhoneField()
  phone: string;

  @IsOptional()
  @TextField('Website', 255)
  website: string;
}
