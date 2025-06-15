import { InputType } from '@nestjs/graphql';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class CartItemIdInput {
  @IdField('CartItem')
  cartItemId: string;
}
