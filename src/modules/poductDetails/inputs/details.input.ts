import { InputType } from '@nestjs/graphql';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class DetailsIdInput {
  @IdField('Details')
  id: string;
}
