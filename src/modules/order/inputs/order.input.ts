import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class OrderIdInput {
  @IdField('Order')
  id: string;
}

@InputType()
export class OrderNameInput {
  @CapitalTextField('Order', 100)
  name: string;
}
