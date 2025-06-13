import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { Order } from '../entities/order.entity';
import { BaseResponse } from 'src/common/bases/BaseResponse';

@ObjectType()
export class CreateOrder {
  @Field(() => Order)
  @Expose()
  order: Order;

  @Field({ nullable: true })
  @Expose({})
  url?: string;
}

@ObjectType()
export class CreateOrderResponse extends BaseResponse {
  @Field(() => CreateOrder, { nullable: true })
  @Expose()
  data: CreateOrder;
}
