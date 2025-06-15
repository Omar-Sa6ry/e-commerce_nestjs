import { InputType } from '@nestjs/graphql';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class ProductIdInput {
  @IdField('Product')
  id: string;
}
