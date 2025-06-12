import { InputType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsString, Length, IsOptional } from 'class-validator';
import { CapitalizeWords } from 'src/common/constant/WordsTransform';

@InputType()
export class CreateCityInput {
  @Field()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => CapitalizeWords(value))
  name: string;

  @Field()
  @IsString()
  countryId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  postalCode?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  state?: string;
}
