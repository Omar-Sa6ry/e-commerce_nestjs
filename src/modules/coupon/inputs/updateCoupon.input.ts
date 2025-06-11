import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateCouponInput } from './createCoupon.input';

@InputType()
export class UpdateCouponInput extends PartialType(CreateCouponInput) {
  @Field()
  id: string;
}
