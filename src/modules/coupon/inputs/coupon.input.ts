import { InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

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
