import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

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
