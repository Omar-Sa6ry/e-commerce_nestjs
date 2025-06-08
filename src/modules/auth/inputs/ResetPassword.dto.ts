import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class ResetPasswordDto {
  @Field()
  token: string

  @Field()
  password: string
}
