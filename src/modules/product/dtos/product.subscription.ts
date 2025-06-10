import { ObjectType, Field } from '@nestjs/graphql';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { Product } from '../entities/product.entity';

@ObjectType()
export class ProductPubsupResponse extends BaseResponse {
  @Field(() => Product, { nullable: true })
  data: Product | null;
}
