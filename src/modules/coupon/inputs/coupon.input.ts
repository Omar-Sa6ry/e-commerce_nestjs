import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decerator/validation/capitalField.decerator';
import { IdField } from 'src/common/decerator/validation/IdValidate.decerator';

@InputType()
export class CouponIdInput {
  @IdField('Coupon')
  couponId: string;
}

@InputType()
export class CouponNameInput {
  @CapitalTextField('Coupon', 100)
  name: string;
}

