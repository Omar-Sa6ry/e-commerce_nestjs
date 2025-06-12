import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { Country } from '../entities/country.entity';

@ObjectType()
export class CountryResponse extends BaseResponse {
  @Field(() => Country, { nullable: true })
  @Expose()
  data: Country;
}

@ObjectType()
export class CountrysResponse extends BaseResponse {
  @Field(() => [Country], { nullable: true })
  items: Country[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
