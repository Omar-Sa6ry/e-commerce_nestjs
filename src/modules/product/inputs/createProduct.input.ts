import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateDetailInput } from '../../poductDetails/inputs/createProductDetails.input';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { CapitalizeWords } from 'src/common/constant/WordsTransform';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @Transform(({ value }) => CapitalizeWords(value))
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Float)
  @IsNumber()
  price: number;

  @Field()
  categoryId: string;

  @Field(() => [CreateDetailInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetailInput)
  details: CreateDetailInput[];

  @Field(() => [CreateImagDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImagDto)
  images: CreateImagDto[];
}
