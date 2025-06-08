import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class CurrentUserDto {
  @Field(() => String)
  id: string

  @Field(() => String)
  email: string
}
