import { Field, InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';

@InputType()
export class CreateColorInput {
  @CapitalTextField('Color name', 100)
  name: string;
}
