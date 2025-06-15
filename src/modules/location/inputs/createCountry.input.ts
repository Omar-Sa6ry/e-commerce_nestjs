import { InputType, Field } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';

@InputType()
export class CreateCountryInput {
  @CapitalTextField('City name', 100)
  name: string;
}
