import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class ColorIdInput {
  @IdField('Color')
  colorId: string;
}

@InputType()
export class ColorNameInput {
  @CapitalTextField('Color', 100)
  name: string;
}
