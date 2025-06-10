import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { Details } from '../entity/productDetails.entity';

@ObjectType()
export class ProductDetailResponse extends BaseResponse {
  @Field(() => Details, { nullable: true })
  @Expose()
  data: Details;
}

@ObjectType()
export class ProductDetailsResponse extends BaseResponse {
  @Field(() => [Details], { nullable: true })
  items: Details[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
