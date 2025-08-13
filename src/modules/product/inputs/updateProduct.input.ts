import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './createProduct.input';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @IdField('Product')
  id: string;
}
