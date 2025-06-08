import { Injectable } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class RedisService {
  constructor (@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set (key: string, value: any, ttl: number = 3600) {
    await this.cacheManager.set(key, value, ttl)
  }

  async get (key: string) {
    return await this.cacheManager.get(key)
  }

  async del (key: string) {
    await this.cacheManager.del(key)
  }
}
