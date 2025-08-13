import { InputType, PartialType } from '@nestjs/graphql';
import { CreateCouponInput } from './createCoupon.input';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class UpdateCouponInput extends PartialType(CreateCouponInput) {
  @IdField('Coupon')
  id: string;
}
