import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';
import { TextField } from 'src/common/decerator/validation/TextField.decerator';

@InputType()
export class FindProductInput {
  @CapitalTextField('Product', 100, true)
  name?: string;

  @TextField('Description', 255, true)
  description?: string;

  @IdField('Category', true)
  categoryId?: string;

  @IdField('Company', true)
  companyId?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  priceMin?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  priceMax?: number;
}
