import { Global, Module } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { TicketSubscriptionResolver } from './expireTicket.resolver'
import { NotifySubscriptionResolver } from './notify.resolver'
import { UpdateflightSubscriptionResolver } from './UpdateFlight.resolver'

@Global()
@Module({
  providers: [
    TicketSubscriptionResolver,
    NotifySubscriptionResolver,
    UpdateflightSubscriptionResolver,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: ['PUB_SUB'],
})
export class PubSubModule {}
