import { ObjectType, Field } from '@nestjs/graphql';
import { OrderStatus } from '../../../common/constant/enum.constant';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { Expose } from 'class-transformer';

@ObjectType()
export class TrackOrderStatus {
  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class TrackOrderStatusResponse extends BaseResponse {
  @Field(() => TrackOrderStatus, { nullable: true })
  @Expose()
  data: TrackOrderStatus;
}
