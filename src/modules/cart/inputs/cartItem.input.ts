import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class CartItemInput {
  @IdField('Product')
  productId: string;

  @IdField('Details')
  detailsId: string;

  @Field(() => Int)
  @IsInt()
  quantity: number;
}
