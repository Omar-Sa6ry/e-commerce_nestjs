import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

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
