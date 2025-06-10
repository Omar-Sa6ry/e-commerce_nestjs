import { InputType, Field, Float, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './createProduct.input';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field()
  id: string;
}
