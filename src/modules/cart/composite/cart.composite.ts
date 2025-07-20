import { I18nService } from "nestjs-i18n";
import { ICartValidator } from "../interfaces/ICart.interface";
import { NotFoundException } from "@nestjs/common";
import { Cart } from "../entities/cart.entity";

export class CartExistsValidator implements ICartValidator {
  constructor(private readonly i18n: I18nService) {}
  async validate(cart: Cart): Promise<void> {
    if (!cart) throw new NotFoundException(await this.i18n.t('cart.NOT_FOUND'));
  }
}

export class CartOwnershipValidator implements ICartValidator {
  constructor(
    private readonly i18n: I18nService,
    private readonly userId: string,
  ) {}
  async validate(cart: Cart): Promise<void> {
    if (cart.userId !== this.userId)
      throw new NotFoundException(await this.i18n.t('cart.NOT_OWNER'));
  }
}

export class CartValidatorComposite implements ICartValidator {
  private validators: ICartValidator[] = [];

  add(validator: ICartValidator): void {
    this.validators.push(validator);
  }

  async validate(cart: Cart): Promise<void> {
    for (const validator of this.validators) {
      await validator.validate(cart);
    }
  }
}