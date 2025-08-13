import { InputType, Field } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';
import { TextField } from 'src/common/decorator/validation/TextField.decorator';

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
