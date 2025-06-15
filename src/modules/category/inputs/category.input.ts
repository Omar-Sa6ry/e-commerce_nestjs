import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class CategoryIdInput {
  @IdField('Category')
  categoryId: string;
}

@InputType()
export class CategoryNameInput {
  @CapitalTextField('Category', 100)
  name: string;
}
