import { BadRequestException, Injectable } from '@nestjs/common';
import { CouponValidationStrategy } from '../interfaces/ICouponStrategy.interface';
import { I18nService } from 'nestjs-i18n';
import { TypeCoupon } from 'src/common/constant/enum.constant';

@Injectable()
export class PercentageCouponStrategy implements CouponValidationStrategy {
  async validate(discount: number, i18n: I18nService): Promise<void> {
    if (discount > 90) {
      throw new BadRequestException(await i18n.t('coupon.PERCENTAGE_LIMIT'));
    }
  }
}

@Injectable()
export class FixedCouponStrategy implements CouponValidationStrategy {
  async validate(discount: number, i18n: I18nService): Promise<void> {
    if (discount <= 0) {
      throw new BadRequestException(
        await i18n.t('coupon.FIXED_AMOUNT_INVALID'),
      );
    }
  }
}

@Injectable()
export class CouponValidationContext {
  private strategies: Map<TypeCoupon, CouponValidationStrategy>;

  constructor(
    private readonly percentageStrategy: PercentageCouponStrategy,
    private readonly fixedStrategy: FixedCouponStrategy,
  ) {
    this.strategies = new Map();
    this.strategies.set(TypeCoupon.PERCENTAGE, this.percentageStrategy);
    this.strategies.set(TypeCoupon.FIXED, this.fixedStrategy);
  }

  async validate(
    type: TypeCoupon,
    discount: number,
    i18n: I18nService,
  ): Promise<void> {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new BadRequestException(await i18n.t('coupon.INVALID_TYPE'));
    }
    await strategy.validate(discount, i18n);
  }
}
