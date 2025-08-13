import { InputType } from '@nestjs/graphql';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class AddressIdInput {
  @IdField('Address')
  addressId: string;
}
