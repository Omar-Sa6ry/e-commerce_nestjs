import { Injectable } from '@nestjs/common';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

@Injectable()
export class RedisConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
      max: parseInt(process.env.REDIS_MAX_ITEMS || '1000', 10),
      retryStrategy: (times) => {
        if (times > 5) {
          return undefined; // End reconnecting after 5 attempts
        }
        return Math.min(times * 100, 5000); // Reconnect after this delay (ms)
      },
    };
  }
}
