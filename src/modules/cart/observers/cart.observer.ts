import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';
import { Cart } from '../entities/cart.entity';
import { ICartObserver } from '../interfaces/ICartObserver.interface';

@Injectable()
export class CartCacheObserver implements ICartObserver {
  constructor(private readonly redisService: RedisService) {}

  async onCartUpdated(cart: Cart): Promise<void> {
    await this.redisService.set(`cart:${cart.id}`, cart);
  }
}
