import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { CartItem } from '../entities/cartItem.enitty';

@ObjectType()
export class CartItemResponse extends BaseResponse {
  @Field(() => CartItem, { nullable: true })
  @Expose()
  data: CartItem | null;
}

@ObjectType()
export class CartItemsResponse extends BaseResponse {
  @Field(() => [CartItem], { nullable: true })
  items: CartItem[] | null;

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
