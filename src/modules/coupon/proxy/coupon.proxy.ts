import { RedisService } from 'src/common/redis/redis.service';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from '../entity/coupon.entity';
import { Repository } from 'typeorm';
import { CouponResponse } from '../dto/couponResponse.dto';
import { NotFoundException } from '@nestjs/common';

export class CouponProxy {
  constructor(
    private readonly redisService: RedisService,
    private readonly i18n: I18nService,
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
  ) {}

  async findById(id: string): Promise<CouponResponse> {
    const cacheKey = `coupon:${id}`;

    const cachedCoupon = await this.redisService.get<Coupon | null>(cacheKey);
    if (cachedCoupon instanceof Coupon) return { data: cachedCoupon };

    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon)
      throw new NotFoundException(
        await this.i18n.t('coupon.NOT_FOUNDS', { args: { id } }),
      );

    this.redisService.set(cacheKey, Coupon);
    return { data: coupon };
  }

  async findByName(name: string): Promise<CouponResponse> {
    const cacheKey = `coupon:name:${name}`;
    const cachedCoupon = await this.redisService.get<Coupon | null>(cacheKey);
    if (cachedCoupon instanceof Coupon) return { data: cachedCoupon };

    const coupon = await this.couponRepository.findOne({ where: { name } });
    if (!coupon)
      throw new NotFoundException(
        await this.i18n.t('coupon.NOT_FOUND_BY_NAME', { args: { name } }),
      );

    this.redisService.set(cacheKey, coupon);
    return { data: coupon };
  }

  async findByIdAndActive(id: string): Promise<CouponResponse> {
    const cacheKey = `coupon:${id}`;

    const cachedCoupon = await this.redisService.get<Coupon | null>(cacheKey);
    if (cachedCoupon instanceof Coupon) return { data: cachedCoupon };

    const coupon = await this.couponRepository.findOne({
      where: { id, isActive: true },
    });
    if (!coupon)
      throw new NotFoundException(
        await this.i18n.t('coupon.NOT_FOUNDS', { args: { id } }),
      );

    this.redisService.set(cacheKey, Coupon);
    return { data: coupon };
  }
}
