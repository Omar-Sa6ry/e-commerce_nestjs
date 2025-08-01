import { I18nService } from 'nestjs-i18n';
import { IOrderValidator } from '../interfaces/IOerderValidator.interface';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entity/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Coupon } from 'src/modules/coupon/entity/coupon.entity';
import { Address } from 'src/modules/address/entity/address.entity';

abstract class AbstractValidationHandler implements IOrderValidator {
  private nextHandler: IOrderValidator;

  constructor(protected i18n: I18nService) {}

  setNext(handler: IOrderValidator): IOrderValidator {
    this.nextHandler = handler;
    return handler;
  }

  async handle(request: any): Promise<void> {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return Promise.resolve();
  }
}

export class UserValidationHandler extends AbstractValidationHandler {
  constructor(
    i18n: I18nService,
    private userRepository: Repository<User>,
  ) {
    super(i18n);
  }

  async handle({
    userId,
    checkCart = false,
  }: {
    userId: string;
    checkCart?: boolean;
  }): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: checkCart ? ['cart', 'cart.cartItems'] : [],
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.NOT_FOUND'));
    }

    if (checkCart && (!user.cart || user.cart.cartItems.length === 0)) {
      throw new BadRequestException(this.i18n.t('cart.EMPTY'));
    }

    return super.handle({ userId, checkCart });
  }
}

export class AddressValidationHandler extends AbstractValidationHandler {
  constructor(
    i18n: I18nService,
    private addressRepository: Repository<Address>,
  ) {
    super(i18n);
  }

  async handle({
    addressId,
  }: {
    userId: string;
    addressId: string;
  }): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException(this.i18n.t('address.NOT_FOUND'));
    }

    return super.handle({ addressId });
  }
}

export class CouponValidationHandler extends AbstractValidationHandler {
  constructor(
    i18n: I18nService,
    private couponRepository: Repository<Coupon>,
  ) {
    super(i18n);
  }

  async handle({ couponId }: { couponId?: string }): Promise<void> {
    if (couponId) {
      const coupon = await this.couponRepository.findOne({
        where: { id: couponId },
      });

      if (!coupon) {
        throw new NotFoundException(this.i18n.t('coupon.NOT_FOUND'));
      }

      if (new Date() > coupon.expiryDate) {
        throw new BadRequestException(this.i18n.t('coupon.EXPIRED'));
      }
    }
    return super.handle({ couponId });
  }
}
