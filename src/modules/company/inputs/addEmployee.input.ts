import { InputType } from '@nestjs/graphql';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class AddEmployeeInput {
  @IdField('company')
  userId: string;

  @IdField('company')
  companyId: string;
}
