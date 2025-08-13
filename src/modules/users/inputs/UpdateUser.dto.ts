import { Field, InputType } from '@nestjs/graphql';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { IsOptional } from 'class-validator';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { PhoneField } from 'src/common/decorator/validation/PhoneField.decorator';
import { EmailField } from 'src/common/decorator/validation/EmailField.decorator';

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
