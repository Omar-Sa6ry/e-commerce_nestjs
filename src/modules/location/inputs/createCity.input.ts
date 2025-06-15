import { InputType, Field } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';
import { TextField } from 'src/common/decerator/validation/TextField.decerator';

@InputType()
export class CreateCityInput {
  @CapitalTextField('City name', 100)
  name: string;

  @IdField('Country')
  countryId: string;

  @TextField('postalCode', 20)
  postalCode?: string;

  @TextField('postalCode', 100)
  state?: string;
}
