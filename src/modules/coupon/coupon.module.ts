import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponService } from './coupon.service';
import { CouponResolver } from './coupon.resolver';
import { Coupon } from './entity/coupon.entity';
import { Category } from '../category/entity/category.entity';
import { UserModule } from '../users/users.module';
import { RedisModule } from 'src/common/redis/redis.module';
import {
  CouponValidationContext,
  FixedCouponStrategy,
  PercentageCouponStrategy,
} from './strategy/coupon.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, Category]),
    RedisModule,
    UserModule,
  ],
  providers: [
    CouponService,
    CouponValidationContext,
    PercentageCouponStrategy,
    FixedCouponStrategy,
    CouponResolver,
  ],
  exports: [CouponService],
})
export class CouponModule {}
