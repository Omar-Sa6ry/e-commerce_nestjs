import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponService } from './coupon.service';
import { CouponResolver } from './coupon.resolver';
import { Coupon } from './entity/coupon.entity';
import { UserModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon]), UserModule],
  providers: [CouponService, CouponResolver],
  exports: [CouponService],
})
export class CouponModule {}
