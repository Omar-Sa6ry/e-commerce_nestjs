import { Product } from "src/modules/product/entities/product.entity";
import { IValidationStrategy } from "../interfaces/IValidationStrategy.interface";
import { Repository } from "typeorm";
import { I18nService } from "nestjs-i18n";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Color } from "src/modules/color/entity/color.entity";
import { User } from "src/modules/users/entity/user.entity";


export class ProductValidationStrategy implements IValidationStrategy {
  constructor(
    private repository: Repository<Product>,
    private i18n: I18nService,
    private productId: string,
  ) {}

  async validate(): Promise<void> {
    const product = await this.repository.findOne({
      where: { id: this.productId },
    });
    if (!product) {
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', {
          args: { id: this.productId },
        }),
      );
    }
  }
}

export class ColorValidationStrategy implements IValidationStrategy {
  constructor(
    private repository: Repository<Color>,
    private i18n: I18nService,
    private colorId: string,
  ) {}

  async validate(): Promise<void> {
    const color = await this.repository.findOne({
      where: { id: this.colorId },
    });
    if (!color) {
      throw new NotFoundException(
        await this.i18n.t('color.NOT_FOUND', { args: { id: this.colorId } }),
      );
    }
  }
}

export class UserValidationStrategy implements IValidationStrategy {
  constructor(
    private repository: Repository<User>,
    private i18n: I18nService,
    private userId: string,
    private productCompanyId: string,
  ) {}

  async validate(): Promise<void> {
    const user = await this.repository.findOne({
      where: { id: this.userId },
    });
    if (!user) {
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));
    }
    if (user.companyId !== this.productCompanyId) {
      throw new BadRequestException(
        await this.i18n.t('product.NOT_PERMISSION'),
      );
    }
  }
}
