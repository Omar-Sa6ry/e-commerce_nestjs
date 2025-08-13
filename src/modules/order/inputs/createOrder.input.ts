import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsInt, IsOptional, Min } from 'class-validator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class CreateOrderItemInput {
  @IdField('Details')
  detailsId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @IdField('UserAddress')
  userAddressId: string;

  @IsOptional()
  @IdField('Coupon')
  couponId?: string;

  @Field(() => [CreateOrderItemInput])
  @IsArray()
  orderItems: CreateOrderItemInput[];
}
