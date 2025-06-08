import { Field, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import { IsBoolean, IsDate, IsInt, IsOptional, IsString } from 'class-validator'

@ObjectType({ isAbstract: true })
export class BaseResponse {
  @IsOptional()
  @Field({ nullable: true })
  @IsString()
  @Expose()
  message?: string

  @IsOptional()
  @Field({ nullable: true })
  @IsBoolean()
  @Expose()
  success?: boolean

  @IsOptional()
  @Field({ nullable: true })
  @Expose()
  timeStamp?: string

  @IsOptional()
  @Field({ nullable: true })
  @IsInt()
  @Expose()
  statusCode?: number
}
