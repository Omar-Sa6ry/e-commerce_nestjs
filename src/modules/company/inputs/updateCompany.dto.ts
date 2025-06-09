import { CapitalizeWords } from 'src/common/constant/CapitalizeWords';
import { InputType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmailConstraint } from 'src/common/constant/validEmail';
import { IsOptional, IsPhoneNumber, Validate } from 'class-validator';

@InputType()
export class UpdateCompanyDto {
  @Field({ nullable: true })
  @IsOptional()
  @Transform(({ value }) => CapitalizeWords(value))
  name?: string;

  // @Field()
  // @IsOptional()
  // @IsNumber()
  // addressId?: string

  @Field({ nullable: true })
  @IsOptional()
  @Validate(IsEmailConstraint)
  @Transform(({ value }) => value.toLowerCase())
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsOptional()
  website?: string;
}
