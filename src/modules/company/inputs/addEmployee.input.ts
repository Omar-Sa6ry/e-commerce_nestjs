import { InputType } from '@nestjs/graphql';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class AddEmployeeInput {
  @IdField('company')
  userId: string;

  @IdField('company')
  companyId: string;
}
