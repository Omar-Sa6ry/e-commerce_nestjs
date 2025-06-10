import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { Product } from '../entities/product.entity';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';

@ObjectType()
export class ProductResponse extends BaseResponse {
  @Field(() => Product, { nullable: true })
  @Expose()
  data: Product;
}

@ObjectType()
export class ProductsResponse extends BaseResponse {
  @Field(() => [Product], { nullable: true })
  items: Product[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
