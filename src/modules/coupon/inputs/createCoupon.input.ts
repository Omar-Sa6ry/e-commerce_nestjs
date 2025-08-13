import { InputType, Field, Int } from '@nestjs/graphql';
import { IsDate, IsInt } from 'class-validator';
import { TypeCoupon } from 'src/common/constant/enum.constant';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

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
