import { InputType, PartialType } from '@nestjs/graphql';
import { CreateCompanyDto } from './createCompany.input';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @IdField('Company')
  id: string;
}
