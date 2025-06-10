import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateDetailInput } from './createProductDetails.input';

@InputType()
export class UpdateProductDetailsInput extends PartialType(CreateDetailInput) {
  @Field()
  id: string;
}
