import { InputType, Field } from '@nestjs/graphql';
import { EmailField } from 'src/common/decerator/validation/EmailField.decerator';
import { IsOptional } from 'class-validator';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { PhoneField } from 'src/common/decerator/validation/PhoneField.decerator';
import { TextField } from 'src/common/decerator/validation/TextField.decerator';

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
