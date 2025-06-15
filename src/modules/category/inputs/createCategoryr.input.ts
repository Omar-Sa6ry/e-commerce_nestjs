import { Field, InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';

@InputType()
export class CreateCategoryInput {
  @Field()
  @CapitalTextField('Category name', 100)
  name: string;
}
