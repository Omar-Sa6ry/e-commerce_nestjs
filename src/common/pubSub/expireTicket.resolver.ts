import { Resolver, Subscription, Mutation } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { TicketExpiredResponsee } from './dto/ticketExpiry.response'

@Resolver()
export class TicketSubscriptionResolver {
  constructor (@Inject('PUB_SUB') private readonly pubSub: PubSub) {}

  @Subscription(() => TicketExpiredResponsee, {
    name: 'ticketExpired',
  })
  ticketExpired () {
    return this.pubSub.asyncIterableIterator('ticketExpired')
  }

//   @Mutation(() => TicketExpiredResponsee)
//   async testTicketExpired (): Promise<TicketExpiredResponsee> {
//     console.log('Publishing event...')

//     await this.pubSub.publish('ticketExpired', {
//       ticketExpired: {
//         id: '123',
//         seatId: '456',
//         message: 'This is a test ticket expiry',
//       },
//     })

//     console.log('Event published.')

//     return {
//       data: {
//         id: '123',
//         seatId: '456',
//         message: 'This is a test ticket expiry',
//       },
//     }
//   }
}
