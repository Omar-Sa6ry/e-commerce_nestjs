import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

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
