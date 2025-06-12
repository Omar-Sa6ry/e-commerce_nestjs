import { InputType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { CapitalizeWords } from 'src/common/constant/WordsTransform';

@InputType()
export class CreateCountryInput {
  @Field()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => CapitalizeWords(value))
  name: string;
}
