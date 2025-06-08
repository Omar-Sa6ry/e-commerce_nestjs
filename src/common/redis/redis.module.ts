import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { RedisService } from './redis.service'
import * as redisStore from 'cache-manager-ioredis'

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: require('cache-manager-redis-store'),
      // store: redisStore,
      ttl: 3600,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
