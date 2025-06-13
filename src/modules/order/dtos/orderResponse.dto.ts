import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { Order } from '../entities/order.entity';

@ObjectType()
export class OrderResponse extends BaseResponse {
  @Field(() => Order, { nullable: true })
  @Expose()
  data: Order;
}

@ObjectType()
export class OrdersResponse extends BaseResponse {
  @Field(() => [Order], { nullable: true })
  items: Order[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
