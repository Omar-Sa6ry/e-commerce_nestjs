import { RedisService } from 'src/common/redis/redis.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entity/coupon.entity';
import { CreateCouponInput } from './inputs/createCoupon.input';
import { I18nService } from 'nestjs-i18n';
import { CouponResponse, CouponsResponse } from './dto/couponResponse.dto';
import { TypeCoupon } from 'src/common/constant/enum.constant';
import { Category } from '../category/entity/category.entity';
import { CouponFactory } from './factory/coupon.factory';
import { UpdateCouponInput } from './inputs/updateCoupon.input';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { Transactional } from 'src/common/decerator/transactional.decerator';
import { CouponProxy } from './proxy/coupon.proxy';
import { CategoryRepositoryProxy } from '../category/proxy/category.proxy';
import { FindCouponInput } from './inputs/findCoupon.input';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CouponService {
  private couponProxy: CouponProxy;
  private categoryProxy: CategoryRepositoryProxy;

  constructor(
    private readonly redisService: RedisService,
    private readonly i18n: I18nService,
    @InjectRepository(Coupon) private categoryRepository: Repository<Category>,
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
  ) {
    this.couponProxy = new CouponProxy(
      this.redisService,
      this.i18n,
      this.couponRepository,
    );
    this.categoryProxy = new CategoryRepositoryProxy(this.categoryRepository);
  }

  @Transactional()
  async create(createCouponInput: CreateCouponInput): Promise<CouponResponse> {
    const existedCoupon = await this.couponProxy.findByName(
      createCouponInput.name,
    );

    if (existedCoupon)
      throw new BadRequestException(
        await this.i18n.t('coupon.EXISTED', {
          args: { name: createCouponInput.name },
        }),
      );

    const existedCategory = await this.categoryProxy.findOneById(
      createCouponInput.categoryId,
    );

    if (!existedCategory)
      throw new NotFoundException(
        await this.i18n.t('category.NOT_FOUND', {
          args: { id: createCouponInput.categoryId },
        }),
      );

    await this.checkValid(createCouponInput.discount, createCouponInput.type);

    const coupon = CouponFactory.create(createCouponInput);
    await this.couponRepository.save(coupon);

    return {
      data: coupon,
      statusCode: 201,
      message: await this.i18n.t('coupon.CREATED'),
    };
  }

  async findByName(name: string): Promise<CouponResponse> {
    return this.couponProxy.findByName(name);
  }

  async findById(id: string): Promise<CouponResponse> {
    return this.couponProxy.findById(id);
  }

  async findByIdAndActive(id: string): Promise<CouponResponse> {
    return this.couponProxy.findByIdAndActive(id);
  }

  async findAll(
    findCouponInput?: FindCouponInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<CouponsResponse> {
    const where: FindOptionsWhere<Coupon> = {};

    const [coupons, total] = await this.couponRepository.findAndCount({
      where: findCouponInput as FindOptionsWhere<Coupon>,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (coupons.length === 0)
      throw new NotFoundException(await this.i18n.t('coupon.NOT_FOUNDS'));

    return {
      items: coupons,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Transactional()
  async update(updateCouponInput: UpdateCouponInput): Promise<CouponResponse> {
    const existedCoupon = await this.couponProxy.findByName(
      updateCouponInput.name,
    );

    if (!existedCoupon) {
      throw new BadRequestException(
        await this.i18n.t('coupon.NOT_FOUND', {
          args: { id: updateCouponInput.id },
        }),
      );
    }

    await this.checkValid(
      updateCouponInput.discount || existedCoupon.data.discount,
      updateCouponInput.type || existedCoupon.data.type,
    );

    Object.assign(existedCoupon.data, updateCouponInput);
    const coupon = await this.couponRepository.save(existedCoupon.data);

    return {
      data: coupon,
      message: await this.i18n.t('coupon.UPDATED', {
        args: { id: coupon.id },
      }),
    };
  }

  async changeIsActive(id: string): Promise<CouponResponse> {
    const coupon = await this.couponRepository.findOne({ where: { id } });

    if (!coupon)
      throw new NotFoundException(
        await this.i18n.t('coupon.NOT_FOUND', { args: { id } }),
      );

    coupon.isActive = !coupon.isActive;
    await this.couponRepository.save(coupon);

    return {
      data: coupon,
      message: await this.i18n.t('coupon.ACTIVE', {
        args: { id, active: !coupon.isActive },
      }),
    };
  }

  @Transactional()
  async delete(id: string): Promise<CouponResponse> {
    const coupon = await this.couponProxy.findById(id);

    if (!coupon)
      throw new NotFoundException(
        await this.i18n.t('coupon.NOT_FOUND', { args: { id } }),
      );

    await this.couponRepository.remove(coupon.data);

    return {
      data: null,
      message: await this.i18n.t('coupon.DELETED', { args: { id } }),
    };
  }

  private async checkValid(discount: number, type: TypeCoupon): Promise<void> {
    if (discount > 90 && type === TypeCoupon.PERCENTAGE)
      throw new BadRequestException(await this.i18n.t('coupon.PERCENTAGE'));
  }
}
