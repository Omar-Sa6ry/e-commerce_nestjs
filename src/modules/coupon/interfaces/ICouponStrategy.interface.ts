import { I18nService } from 'nestjs-i18n';

export interface CouponValidationStrategy {
  validate(discount: number, i18n: I18nService): Promise<void>;
}
