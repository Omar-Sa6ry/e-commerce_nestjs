import { InputType, PartialType } from '@nestjs/graphql';
import { CreateDetailInput } from './createProductDetails.input';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class UpdateProductDetailsInput extends PartialType(CreateDetailInput) {
  @IdField('Details')
  id: string;
}
