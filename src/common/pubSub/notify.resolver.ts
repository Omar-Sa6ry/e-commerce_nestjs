import { Resolver, Subscription, Mutation } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { NotifySubscription } from './dto/notifyUsers.response'

@Resolver()
export class NotifySubscriptionResolver {
  constructor (@Inject('PUB_SUB') private readonly pubSub: PubSub) {}

  @Subscription(() => NotifySubscription, {
    name: 'notifyUsers',
  })
  notifyUsers () {
    return this.pubSub.asyncIterableIterator('notifyUsers')
  }
}
