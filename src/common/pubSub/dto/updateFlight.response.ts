import { ObjectType, Field } from '@nestjs/graphql'
import { BaseResponse } from '../../bases/BaseResponse'

@ObjectType()
export class UpdateFlightSubscription {
  @Field()
  userId: string

  @Field()
  message: string
}

@ObjectType()
export class TicketExpiredResponsee extends BaseResponse {
  @Field(() => UpdateFlightSubscription, { nullable: true })
  data: UpdateFlightSubscription | null
}
