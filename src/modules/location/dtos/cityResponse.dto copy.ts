import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { City } from '../entities/city.entity';

@ObjectType()
export class CityResponse extends BaseResponse {
  @Field(() => City, { nullable: true })
  @Expose()
  data: City;
}

@ObjectType()
export class CitysResponse extends BaseResponse {
  @Field(() => [City], { nullable: true })
  items: City[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
