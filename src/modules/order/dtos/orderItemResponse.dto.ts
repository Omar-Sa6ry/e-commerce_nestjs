import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { OrderItem } from '../entities/orderItem.entity';

@ObjectType()
export class OrderItemResponse extends BaseResponse {
  @Field(() => OrderItem, { nullable: true })
  @Expose()
  data: OrderItem;
}

@ObjectType()
export class OrderItemsResponse extends BaseResponse {
  @Field(() => [OrderItem], { nullable: true })
  items: OrderItem[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
