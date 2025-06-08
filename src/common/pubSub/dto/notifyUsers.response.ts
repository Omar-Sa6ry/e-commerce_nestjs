import { ObjectType, Field } from '@nestjs/graphql'
import { BaseResponse } from '../../bases/BaseResponse'

@ObjectType()
export class NotifySubscription {
  @Field()
  userId: string

  @Field()
  message: string
}

@ObjectType()
export class TicketExpiredResponsee extends BaseResponse {
  @Field(() => NotifySubscription, { nullable: true })
  data: NotifySubscription | null
}
