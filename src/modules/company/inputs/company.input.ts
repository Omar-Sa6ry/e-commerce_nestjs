import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class CompanyIdInput {
  @IdField('Company')
  companyId: string;
}

@InputType()
export class CompanyNameInput {
  @CapitalTextField('Company', 100)
  name: string;
}

@InputType()
export class CompanyUserIdInput {
  @IdField('user')
  userId: string;
}
