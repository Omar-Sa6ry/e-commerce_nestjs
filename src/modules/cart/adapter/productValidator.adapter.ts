import { I18nService } from 'nestjs-i18n';
import { Details } from 'src/modules/poductDetails/entity/productDetails.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Repository } from 'typeorm';
import { IProductValidator } from '../interfaces/ProductValidator.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export class ProductValidatorAdapter implements IProductValidator {
  constructor(
    private readonly productRepository: Repository<Product>,
    private readonly detailsRepository: Repository<Details>,
    private readonly i18n: I18nService,
  ) {}

  async validate(
    productId: string,
    detailsId: string,
  ): Promise<{ product: Product; detail: Details }> {
    const [product, detail] = await Promise.all([
      this.productRepository.findOne({ where: { id: productId } }),
      this.detailsRepository.findOne({
        where: { id: detailsId },
        relations: ['product'],
      }),
    ]);

    if (!product)
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', { args: { id: productId } }),
      );
    if (!detail)
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND', {
          args: { id: detailsId },
        }),
      );
    if (detail.product.id !== productId)
      throw new BadRequestException(
        await this.i18n.t('productDetails.NOT_MATCHED', {
          args: { id: detail.product.id },
        }),
      );

    return { product, detail };
  }
}
