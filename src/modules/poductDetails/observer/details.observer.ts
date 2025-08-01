import { RedisService } from 'src/common/redis/redis.service';
import { ICacheObserver } from '../interfaces/IProductDetailsObserver';

export class RedisCacheObserver implements ICacheObserver {
  constructor(private redisService: RedisService) {}

  async update(key: string): Promise<void> {
    await this.redisService.del(key);
  }
}

export class CacheSubject {
  private observers: ICacheObserver[] = [];

  addObserver(observer: ICacheObserver): void {
    this.observers.push(observer);
  }

  async notify(key: string): Promise<void> {
    await Promise.all(this.observers.map((o) => o.update(key)));
  }
}
