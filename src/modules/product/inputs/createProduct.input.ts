import { Type } from 'class-transformer';
import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNumber, IsArray, ValidateNested } from 'class-validator';
import { CreateDetailInput } from '../../poductDetails/inputs/createProductDetails.input';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';
import { TextField } from 'src/common/decerator/validation/TextField.decerator';

@InputType()
export class CreateProductInput {
  @IdField('Category')
  categoryId: string;

  @CapitalTextField('Product name', 100)
  name: string;

  @TextField('Product description', 255)
  description: string;

  @Field(() => Float)
  @IsNumber()
  price: number;

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
