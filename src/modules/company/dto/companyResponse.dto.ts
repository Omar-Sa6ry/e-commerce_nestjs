import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { Company } from '../entity/company.entity';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';

@ObjectType()
export class CompanyResponse extends BaseResponse {
  @Field(() => Company, { nullable: true })
  @Expose()
  data: Company;
}

@ObjectType()
export class CompanysResponse extends BaseResponse {
  @Field(() => [Company], { nullable: true })
  items: Company[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
