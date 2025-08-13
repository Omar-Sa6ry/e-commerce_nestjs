import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Coupon } from './entity/coupon.entity';
import { CreateCouponInput } from './inputs/createCoupon.input';
import { CouponResponse, CouponsResponse } from './dto/couponResponse.dto';
import { I18nService } from 'nestjs-i18n';
import { CouponFactory } from './factory/coupon.factory';
import { CouponProxy } from './proxy/coupon.proxy';
import { CategoryRepositoryProxy } from '../category/proxy/category.proxy';
import { RedisService } from 'src/common/redis/redis.service';
import { CouponValidationContext } from './strategy/coupon.strategy';
import { Category } from '../category/entity/category.entity';
import { Transactional } from 'src/common/decorator/transactional.decorator';
import { TypeCoupon } from 'src/common/constant/enum.constant';
import { UpdateCouponInput } from './inputs/updateCoupon.input';
import { FindCouponInput } from './inputs/findCoupon.input';
import { Limit, Page } from 'src/common/constant/messages.constant';

@Injectable()
export class CouponService {
  private couponProxy: CouponProxy;
  private categoryProxy: CategoryRepositoryProxy;

  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    private readonly validationContext: CouponValidationContext,
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
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
    if (existedCoupon) {
      throw new BadRequestException(
        await this.i18n.t('coupon.EXISTED', {
          args: { name: createCouponInput.name },
        }),
      );
    }

    const existedCategory = await this.categoryProxy.findOneById(
      createCouponInput.categoryId,
    );
    if (!existedCategory) {
      throw new NotFoundException(
        await this.i18n.t('category.NOT_FOUND', {
          args: { id: createCouponInput.categoryId },
        }),
      );
    }

    await this.validationContext.validate(
      createCouponInput.type,
      createCouponInput.discount,
      this.i18n,
    );

    const coupon = CouponFactory.create(createCouponInput);
    await this.couponRepository.save(coupon);

    return {
      data: coupon,
      statusCode: 201,
      message: await this.i18n.t('coupon.CREATED'),
    };
  }

  @Transactional()
  async changeIsActive(id: string): Promise<CouponResponse> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(
        await this.i18n.t('coupon.NOT_FOUND', { args: { id } }),
      );
    }

    coupon.isActive = !coupon.isActive;
    await this.couponRepository.save(coupon);

    return {
      data: coupon,
      message: await this.i18n.t('coupon.ACTIVE', {
        args: { id, active: coupon.isActive },
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

    const existedCategory = await this.categoryProxy.findOneById(
      updateCouponInput.categoryId,
    );
    if (!existedCategory) {
      throw new NotFoundException(
        await this.i18n.t('category.NOT_FOUND', {
          args: { id: updateCouponInput.categoryId },
        }),
      );
    }
    await this.validationContext.validate(
      updateCouponInput.type,
      updateCouponInput.discount,
      this.i18n,
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
}
