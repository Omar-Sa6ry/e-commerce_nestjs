import { ObjectType, Field } from '@nestjs/graphql'
import { BaseResponse } from '../../bases/BaseResponse'

@ObjectType()
export class TicketExpired {
  @Field()
  id: string

  @Field()
  seatId: string

  @Field()
  message: string
}

@ObjectType()
export class TicketExpiredResponsee extends BaseResponse {
  @Field(() => TicketExpired, { nullable: true })
  data: TicketExpired | null
}
