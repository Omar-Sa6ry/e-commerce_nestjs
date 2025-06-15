import { Field, InputType } from '@nestjs/graphql';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { EmailField } from 'src/common/decerator/validation/EmailField.decerator';
import { IsOptional } from 'class-validator';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { PhoneField } from 'src/common/decerator/validation/PhoneField.decerator';

@InputType()
export class UpdateUserDto {
  @CapitalTextField('First name', 100, true)
  firstName?: string;

  @CapitalTextField('Last name', 100, true)
  lastName?: string;

  @Field(() => CreateImagDto, { nullable: true })
  @IsOptional()
  avatar?: CreateImagDto;

  @EmailField(true)
  email?: string;

  @PhoneField(true)
  phone?: string;
}
