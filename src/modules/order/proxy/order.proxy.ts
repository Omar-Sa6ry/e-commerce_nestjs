import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderResponse } from '../dtos/orderResponse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/common/redis/redis.service';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderProxy {
  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
  ) {}

  async findById(id: string): Promise<OrderResponse> {
    const cacheKey = `order:${id}`;

    const cachedOrder = await this.redisService.get<Order | null>(cacheKey);
    if (cachedOrder instanceof Order) return { data: cachedOrder };

    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'orderItems',
        'orderItems.productDetails',
        'address',
        'coupon',
        'user',
      ],
    });

    if (!order) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUND'));
    }

    this.redisService.set(cacheKey, Order);
    return { data: order };
  }
}
