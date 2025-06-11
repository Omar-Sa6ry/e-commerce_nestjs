import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';

@ObjectType()
export class TotalCartsResponse extends BaseResponse {
  @Field(() => Float, { nullable: true })
  @Expose()
  data: number;
}
