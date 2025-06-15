import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './createProduct.input';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @IdField('Product')
  id: string;
}
