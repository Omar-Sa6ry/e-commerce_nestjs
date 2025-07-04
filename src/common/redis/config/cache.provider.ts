import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

export class RedisCacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      isGlobal: true,
      store: redisStore,
      ttl: 3600,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    };
  }
}
