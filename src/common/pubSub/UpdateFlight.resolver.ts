import { Resolver, Subscription, Mutation } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { UpdateFlightSubscription } from './dto/updateFlight.response'

@Resolver()
export class UpdateflightSubscriptionResolver {
  constructor (@Inject('PUB_SUB') private readonly pubSub: PubSub) {}

  @Subscription(() => UpdateFlightSubscription, {
    name: 'updateFlight',
  })
  updateFlight () {
    return this.pubSub.asyncIterableIterator('updateFlight')
  }
}
