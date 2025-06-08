import { Field, ObjectType } from '@nestjs/graphql'
import { Expose } from 'class-transformer'
import { BaseResponse } from 'src/common/bases/BaseResponse'
import { User } from 'src/modules/users/entity/user.entity'

@ObjectType()
export class AuthOutPut  {
  @Field(() => User)
  @Expose()
  user: User

  @Field()
  @Expose()
  token: string
}

@ObjectType()
export class AuthResponse extends BaseResponse {
  @Field(() => AuthOutPut, { nullable: true })
  @Expose()
  data: AuthOutPut
}
