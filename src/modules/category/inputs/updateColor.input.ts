import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class UpdateCategoryInput {
  @IdField('Category')
  id: string;

  @CapitalTextField('Category name', 100)
  name: string;
}
