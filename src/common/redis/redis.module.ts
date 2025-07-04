import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './redis.service';
import { RedisCacheConfigService } from './config/cache.provider';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: RedisCacheConfigService,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
