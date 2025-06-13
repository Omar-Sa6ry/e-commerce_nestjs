import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class CreateOrderItemInput {
  @Field(() => String)
  @IsInt()
  detailsId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => String)
  @IsInt()
  userAddressId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsInt()
  couponId?: string;

  @Field(() => [CreateOrderItemInput])
  @IsArray()
  orderItems: CreateOrderItemInput[];
}
