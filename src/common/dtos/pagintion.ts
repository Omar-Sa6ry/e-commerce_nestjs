import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  @Expose()
  totalPages: number

  @Field(() => Int)
  @Expose()
  currentPage: number

  @Field(() => Int)
  @Expose()
  totalItems: number
}
