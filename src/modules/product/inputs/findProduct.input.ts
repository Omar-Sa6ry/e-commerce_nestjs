import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';
import { TextField } from 'src/common/decorator/validation/TextField.decorator';

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
