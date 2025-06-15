import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

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
