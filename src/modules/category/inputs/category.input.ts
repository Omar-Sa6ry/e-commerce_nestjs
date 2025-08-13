import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

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
