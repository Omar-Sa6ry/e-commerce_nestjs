import { Field, InputType } from '@nestjs/graphql';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { Transform } from 'class-transformer';
import { IsEmailConstraint } from 'src/common/constant/validEmail';
import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  IsOptional,
  Validate,
} from 'class-validator';

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  avatar?: CreateImagDto;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  @Validate(IsEmailConstraint)
  @Transform(({ value }) => value.toLowerCase())
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber('EG')
  phone?: string;
}
