import { NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Cart } from '../entities/cart.entity';
import { ICartValidator } from '../interfaces/ICart.interface';

export class CartExistsValidator implements ICartValidator {
  private nextValidator: ICartValidator;

  constructor(private readonly i18n: I18nService) {}

  setNext(validator: ICartValidator): ICartValidator {
    this.nextValidator = validator;
    return validator;
  }

  async validate(cart: Cart): Promise<void> {
    if (!cart) throw new NotFoundException(await this.i18n.t('cart.NOT_FOUND'));

    if (this.nextValidator) await this.nextValidator.validate(cart);
  }
}
