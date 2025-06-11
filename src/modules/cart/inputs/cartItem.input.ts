import { Field, InputType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';

@InputType()
export class CartItemInput {
  @Field()
  productId: string;

  @Field()
  detailsId: string;

  @Field()
  @IsInt()
  quantity: number;
}
