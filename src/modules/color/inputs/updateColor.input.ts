import { InputType } from '@nestjs/graphql';
import { IsHexColor } from 'class-validator';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class UpdateColorInput {
  @IdField('Color')
  id: string;

  @CapitalTextField('Color name', 100)
  @IsHexColor()
  name: string;
}
