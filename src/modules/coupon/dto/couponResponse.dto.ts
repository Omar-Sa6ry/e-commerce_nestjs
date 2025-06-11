import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { Coupon } from '../entity/coupon.entity';

@ObjectType()
export class CouponResponse extends BaseResponse {
  @Field(() => Coupon, { nullable: true })
  @Expose()
  data: Coupon;
}

@ObjectType()
export class CouponsResponse extends BaseResponse {
  @Field(() => [Coupon], { nullable: true })
  items: Coupon[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
