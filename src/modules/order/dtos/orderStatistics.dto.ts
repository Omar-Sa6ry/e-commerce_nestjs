import { ObjectType, Field, Int } from '@nestjs/graphql';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { Expose } from 'class-transformer';

@ObjectType()
export class OrderStatistics {
  @Field(() => Int)
  totalOrders: number;

  @Field(() => Int)
  completedOrders: number;

  @Field(() => Int)
  canceledOrders: number;

  @Field(() => Int)
  totalRevenue: number;
}

@ObjectType()
export class OrderStatisticsResponse extends BaseResponse {
  @Field(() => OrderStatistics, { nullable: true })
  @Expose()
  data: OrderStatistics;
}
