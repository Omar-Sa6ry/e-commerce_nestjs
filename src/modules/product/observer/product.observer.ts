import { RedisService } from "src/common/redis/redis.service";
import { Product } from "../entities/product.entity";
import { ICacheObserver } from "../interfaces/ICachObserver.interface";

export class ProductCacheManager {
  private observers: ICacheObserver[] = [];

  addObserver(observer: ICacheObserver): void {
    this.observers.push(observer);
  }

  async notifyProductUpdated(product: Product): Promise<void> {
    await Promise.all(
      this.observers.map((observer) => observer.onProductUpdated(product)),
    );
  }
}

export class RedisCacheObserver implements ICacheObserver {
  constructor(private readonly redisService: RedisService) {}

  async onProductUpdated(product: Product): Promise<void> {
    await this.redisService.set(`product:${product.id}`, product);
  }
}
