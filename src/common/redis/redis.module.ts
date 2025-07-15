import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisConfigService } from './config/redisConfig.service';
import { RedisService } from './redis.service';
import { RedisServiceProvider } from './provider/redisService.provider';
import { createRedisClient } from './factory/redisClient.factory';
import { RedisHealth } from './redis.health';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: RedisConfigService,
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: createRedisClient,
    },
    RedisHealth,
    RedisService,
    RedisServiceProvider,
  ],
  exports: [RedisService, RedisServiceProvider],
})
export class RedisModule {}
