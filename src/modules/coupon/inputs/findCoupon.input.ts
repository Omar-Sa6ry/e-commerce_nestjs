import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateCouponInput } from './createCoupon.input';
import { IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class FindCouponInput extends PartialType(CreateCouponInput) {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
