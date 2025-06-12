import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { UserAddress } from '../entity/userAddress.entity';

@ObjectType()
export class UserAddressResponse extends BaseResponse {
  @Field(() => UserAddress, { nullable: true })
  @Expose()
  data: UserAddress;
}

@ObjectType()
export class UserAddresssResponse extends BaseResponse {
  @Field(() => [UserAddress], { nullable: true })
  items: UserAddress[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
