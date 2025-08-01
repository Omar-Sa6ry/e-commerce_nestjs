import { I18nService } from 'nestjs-i18n';
import { RedisService } from './../../../common/redis/redis.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductDetailResponse } from '../dto/productDetailsResponse.dto';
import { Product } from '../../product/entities/product.entity';
import { Details } from '../entity/productDetails.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheSubject, RedisCacheObserver } from '../observer/details.observer';

@Injectable()
export class ProductDetailsProxy {
  private cacheSubject = new CacheSubject();

  constructor(
    @InjectRepository(Details) private detailsRepository: Repository<Details>,
    private readonly redisService: RedisService,
    private readonly i18n: I18nService,
  ) {
    this.cacheSubject.addObserver(new RedisCacheObserver(redisService));
  }

  async invalidateCache(id: string): Promise<void> {
    await this.cacheSubject.notify(`details:${id}`);
  }

  async findOne(id: string): Promise<ProductDetailResponse> {
    const cacheKey = `details:${id}`;
    const cachedDetails = await this.redisService.get<Details | null>(cacheKey);
    if (cachedDetails instanceof Details) return { data: cachedDetails };

    const detail = await this.detailsRepository.findOne({ where: { id } });

    if (!detail)
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND', { args: { id } }),
      );

    this.redisService.set(cacheKey, detail);
    return { data: detail };
  }

  async getProductForDetail(detailId: string): Promise<Product> {
    const detail = await this.detailsRepository.findOne({
      where: { id: detailId },
      relations: ['product'],
    });

    if (!detail) {
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND', {
          args: { id: detailId },
        }),
      );
    }

    this.redisService.set(`details:${detailId}`, detail);
    this.redisService.set(`product:${detail.product.id}`, detail.product);

    return detail.product;
  }
}
