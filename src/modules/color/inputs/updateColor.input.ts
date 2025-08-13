import { InputType } from '@nestjs/graphql';
import { IsHexColor } from 'class-validator';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class UpdateColorInput {
  @IdField('Color')
  id: string;

  @CapitalTextField('Color name', 100)
  @IsHexColor()
  name: string;
}
