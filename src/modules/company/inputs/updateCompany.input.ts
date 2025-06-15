import { InputType, PartialType } from '@nestjs/graphql';
import { CreateCompanyDto } from './createCompany.input';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
    @IdField('Company')
    id: string
}
