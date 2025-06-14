import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { Color } from '../entity/color.entity';

@ObjectType()
export class ColorResponse extends BaseResponse {
  @Field(() => Color, { nullable: true })
  @Expose()
  data: Color;
}

@ObjectType()
export class ColorsResponse extends BaseResponse {
  @Field(() => [Color], { nullable: true })
  items: Color[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
