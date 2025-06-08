import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class ChangePasswordDto {
  @Field()
  password: string

  @Field()
  newPassword: string
}
