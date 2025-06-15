import { InputType, Field, Int } from '@nestjs/graphql';
import { IsDate, IsInt } from 'class-validator';
import { TypeCoupon } from 'src/common/constant/enum.constant';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class CreateCouponInput {
  @Field()
  @IsDate()
  expiryDate: Date;

  @CapitalTextField('Coupon name', 100)
  name: string;

  @IdField('Category')
  categoryId: string;

  @Field(() => TypeCoupon)
  type: TypeCoupon;

  @Field(() => Int)
  @IsInt()
  discount: number;
}
