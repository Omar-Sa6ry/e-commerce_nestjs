import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { Address } from '../entity/address.entity';

@ObjectType()
export class AddressResponse extends BaseResponse {
  @Field(() => Address, { nullable: true })
  @Expose()
  data: Address;
}
