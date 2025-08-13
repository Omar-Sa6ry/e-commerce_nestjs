import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class LocationIdInput {
  @IdField('Location')
  LocationId: string;
}

@InputType()
export class LocationNameInput {
  @CapitalTextField('Location', 100)
  name: string;
}
