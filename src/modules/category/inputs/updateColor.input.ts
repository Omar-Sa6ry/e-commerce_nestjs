import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class UpdateCategoryInput {
  @IdField('Category')
  id: string;

  @CapitalTextField('Category name', 100)
  name: string;
}
