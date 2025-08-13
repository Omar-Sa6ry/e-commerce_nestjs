import { Field, InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';

@InputType()
export class CreateCategoryInput {
  @Field()
  @CapitalTextField('Category name', 100)
  name: string;
}
