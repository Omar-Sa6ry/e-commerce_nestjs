import { Injectable } from '@nestjs/common';
import { Coupon } from '../entity/coupon.entity';
import { CreateCouponInput } from '../inputs/createCoupon.input';

@Injectable()
export class CouponFactory {
  static create(input: CreateCouponInput): Coupon {
    const coupon = new Coupon();
    Object.assign(coupon, input);
    return coupon;
  }
}
