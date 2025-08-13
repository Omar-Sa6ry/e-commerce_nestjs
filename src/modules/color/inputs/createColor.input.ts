import {  InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';

@InputType()
export class CreateColorInput {
  @CapitalTextField('Color name', 100)
  name: string;
}
