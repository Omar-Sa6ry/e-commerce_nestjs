import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entity/coupon.entity';
import { CreateCouponInput } from './inputs/createCoupon.input';
import { I18nService } from 'nestjs-i18n';
import { CouponResponse, CouponsResponse } from './dto/couponResponse.dto';
import { UpdateCouponInput } from './inputs/updateCoupon.input';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { FindCouponInput } from './inputs/findCoupon.input';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TypeCoupon } from 'src/common/constant/enum.constant';

@Injectable()
export class CouponService {
  constructor(
    private dataSource: DataSource,
    private readonly i18n: I18nService,
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponInput: CreateCouponInput): Promise<CouponResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existedCoupon = await queryRunner.manager.findOne(Coupon, {
        where: { name: createCouponInput.name },
      });

      if (existedCoupon)
        throw new BadRequestException(
          await this.i18n.t('coupon.EXISTED', {
            args: { name: createCouponInput.name },
          }),
        );

      await this.checkValid(createCouponInput.discount, createCouponInput.type);

      const coupon = queryRunner.manager.create(Coupon, createCouponInput);
      await queryRunner.manager.save(coupon);
      await queryRunner.commitTransaction();

      return {
        data: coupon,
        statusCode: 201,
        message: await this.i18n.t('coupon.CREATED'),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByName(name: string): Promise<CouponResponse> {
    const coupon = await this.couponRepository.findOne({ where: { name } });
    if (!coupon)
      throw new NotFoundException(
        await this.i18n.t('coupon.NOT_FOUND_BY_NAME', { args: { name } }),
      );

    return { data: coupon };
  }

  async findById(id: string): Promise<CouponResponse> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon)
      throw new NotFoundException(
        await this.i18n.t('coupon.NOT_FOUNDS', { args: { id } }),
      );

    return { data: coupon };
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

  async update(updateCouponInput: UpdateCouponInput): Promise<CouponResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingCouponById = await queryRunner.manager.findOne(Coupon, {
        where: { id: updateCouponInput.id },
      });

      if (!existingCouponById) {
        throw new BadRequestException(
          await this.i18n.t('coupon.NOT_FOUND', {
            args: { id: updateCouponInput.id },
          }),
        );
      }

      await this.checkValid(
        updateCouponInput.discount || existingCouponById.discount,
        updateCouponInput.type || existingCouponById.type,
      );

      Object.assign(existingCouponById, updateCouponInput);
      const coupon = await queryRunner.manager.save(existingCouponById);

      await queryRunner.commitTransaction();

      return {
        data: coupon,
        message: await this.i18n.t('coupon.UPDATED', {
          args: { id: coupon.id },
        }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  async delete(id: string): Promise<CouponResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const coupon = await queryRunner.manager.findOne(Coupon, {
        where: { id },
      });

      if (!coupon)
        throw new NotFoundException(
          await this.i18n.t('coupon.NOT_FOUND', { args: { id } }),
        );

      await queryRunner.manager.remove(coupon);
      await queryRunner.commitTransaction();

      return {
        data: null,
        message: await this.i18n.t('coupon.DELETED', { args: { id } }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async checkValid(discount: number, type: TypeCoupon): Promise<void> {
    if (discount > 90 && type === TypeCoupon.PERCENTAGE)
      throw new BadRequestException(await this.i18n.t('coupon.PERCENTAGE'));
  }
}
