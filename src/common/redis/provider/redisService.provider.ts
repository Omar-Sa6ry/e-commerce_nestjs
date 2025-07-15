import { Provider } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { RedisService } from '../redis.service';
import { IRedisInterface } from '../interface/redis.interface';

export const RedisServiceProvider: Provider = {
  provide: 'IRedisService',
  useFactory: (
    redisClient: RedisClientType,
    cacheManager: any,
  ): IRedisInterface => {
    return new RedisService(cacheManager, redisClient);
  },
  inject: ['REDIS_CLIENT', 'CACHE_MANAGER'],
};
