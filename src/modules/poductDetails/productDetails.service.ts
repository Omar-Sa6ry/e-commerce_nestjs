import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { Color } from '../color/entity/color.entity';
import { ProductDetailsFactory } from './factory/productDetails.factory';
import { Details } from './entity/productDetails.entity';
import { User } from '../users/entity/user.entity';
import { Transactional } from 'src/common/decorator/transactional.decorator';
import { CreateDetailInput } from './inputs/createProductDetails.input';
import { FindProductDetailsInput } from './inputs/findProductDetails.input';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { UpdateProductDetailsInput } from './inputs/updateProductDetails.input';
import { Size } from 'src/common/constant/enum.constant';
import { ProductDetailsProxy } from './proxy/productDetails.proxy';
import { IValidationStrategy } from './interfaces/IValidationStrategy.interface';
import {
  ColorValidationStrategy,
  ProductValidationStrategy,
  UserValidationStrategy,
} from './strategy/details.strategy';
import {
  ProductDetailResponse,
  ProductDetailsResponse,
} from './dto/productDetailsResponse.dto';

@Injectable()
export class ProductDetailsService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Details)
    private readonly productDetailsRepository: Repository<Details>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly productDetailsProxy: ProductDetailsProxy,
  ) {}

  private async runValidations(
    productId: string,
    colorId: string,
    userId: string,
  ): Promise<[Product, User]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    const strategies: IValidationStrategy[] = [
      new ProductValidationStrategy(
        this.productRepository,
        this.i18n,
        productId,
      ),
      new ColorValidationStrategy(this.colorRepository, this.i18n, colorId),
      new UserValidationStrategy(
        this.userRepository,
        this.i18n,
        userId,
        product.companyId,
      ),
    ];

    for (const strategy of strategies) {
      await strategy.validate();
    }

    return [
      product,
      await this.userRepository.findOne({ where: { id: userId } }),
    ];
  }

  @Transactional()
  async add(
    createDetailInput: CreateDetailInput,
    userId: string,
  ): Promise<ProductDetailResponse> {
    await this.runValidations(
      createDetailInput.productId,
      createDetailInput.colorId,
      userId,
    );

    const existingDetail = await this.findExistingDetail(createDetailInput);

    if (existingDetail) {
      const updatedDetail = await this.updateDetailQuantity(
        existingDetail,
        createDetailInput.quantity,
      );
      await this.productDetailsProxy.invalidateCache(updatedDetail.id);
      return this.buildSuccessResponse(
        updatedDetail,
        'productDetails.ADDQUANTITY',
        { quantity: updatedDetail.quantity },
      );
    }

    const newDetail = await this.createNewDetail(createDetailInput);
    return this.buildSuccessResponse(newDetail, 'product.CREATED');
  }

  async findAll(
    findProductDetailsInput?: FindProductDetailsInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<ProductDetailsResponse> {
    const where: FindOptionsWhere<Details> = {};

    if (findProductDetailsInput) {
      if (findProductDetailsInput.colorId)
        where.colorId = findProductDetailsInput.colorId;

      if (findProductDetailsInput.size)
        where.size = findProductDetailsInput.size;
    }

    const [details, total] = await this.productDetailsRepository.findAndCount({
      where,
      order: { quantity: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (details.length === 0)
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUNDS'),
      );

    return {
      items: details,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Transactional()
  async update(
    updateProductInput: UpdateProductDetailsInput,
    userId: string,
  ): Promise<ProductDetailResponse> {
    const detail = await this.findDetail(updateProductInput.id);

    await this.runValidations(
      updateProductInput.productId,
      updateProductInput.colorId ? updateProductInput.colorId : detail.colorId,
      userId,
    );

    if (updateProductInput.quantity)
      detail.quantity = updateProductInput.quantity;

    if (updateProductInput.colorId)
      await this.validateAndUpdateColor(detail, updateProductInput.colorId);

    if (updateProductInput.size)
      await this.validateAndUpdateSize(detail, updateProductInput.size);

    await this.productDetailsRepository.save(detail);
    await this.productDetailsProxy.invalidateCache(detail.id);

    return {
      data: detail,
      message: await this.i18n.t('productDetails.UPDATED', {
        args: { id: updateProductInput.id },
      }),
    };
  }

  @Transactional()
  async remove(id: string, userId: string): Promise<ProductDetailResponse> {
    const detail = await this.productDetailsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!detail)
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND', { args: { id } }),
      );

    await this.runValidations(detail.productId, detail.colorId, userId);
    await this.productDetailsRepository.remove(detail);
    await this.productDetailsProxy.invalidateCache(detail.id);

    return {
      data: null,
      message: await this.i18n.t('product.DELETED', { args: { id } }),
    };
  }

  async findColorsFromDetailsId(detailId: string): Promise<Color> {
    const detail = await this.productDetailsRepository.findOne({
      where: { id: detailId },
      relations: ['color'],
    });

    if (!detail) {
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND', {
          args: { id: detailId },
        }),
      );
    }

    return detail.color;
  }

  private async findExistingDetail(createDetailInput: CreateDetailInput) {
    const allDetails = await this.productDetailsRepository.find({
      where: { productId: createDetailInput.productId },
    });

    return allDetails.find(
      (detail) =>
        detail.colorId === createDetailInput.colorId &&
        detail.size === createDetailInput.size,
    );
  }

  private async updateDetailQuantity(detail: Details, quantityToAdd: number) {
    detail.quantity += quantityToAdd;
    await this.productDetailsRepository.save(detail);
    return detail;
  }

  private async createNewDetail(createDetailInput: CreateDetailInput) {
    const detail = ProductDetailsFactory.create(createDetailInput);
    await this.productDetailsRepository.save(detail);
    return detail;
  }

  private async buildSuccessResponse(
    data: Details,
    messageKey: string,
    args?: Record<string, any>,
  ): Promise<ProductDetailResponse> {
    return {
      statusCode: 201,
      data,
      message: await this.i18n.t(messageKey, args ? { args } : undefined),
    };
  }

  private async findDetail(id: string): Promise<Details> {
    const detail = await this.productDetailsRepository.findOne({
      where: { id },
      relations: ['product', 'color'],
    });

    if (!detail) {
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND', {
          args: { id },
        }),
      );
    }

    return detail;
  }

  private async validateAndUpdateColor(
    detail: Details,
    colorId: string,
  ): Promise<void> {
    const existingDetail = await this.productDetailsRepository.findOneBy({
      colorId: colorId,
      size: detail.size,
      productId: detail.productId,
    });

    if (existingDetail) {
      throw new BadRequestException(
        await this.i18n.t('productDetails.EXISTEDCOLOR', {
          args: { color: colorId },
        }),
      );
    }

    detail.colorId = colorId;
  }

  private async validateAndUpdateSize(
    detail: Details,
    newSize: Size,
  ): Promise<void> {
    const existingDetail = await this.productDetailsRepository.findOneBy({
      color: detail.color,
      size: newSize,
      productId: detail.productId,
    });

    if (existingDetail) {
      throw new BadRequestException(
        await this.i18n.t('productDetails.EXISTEDSIZE', {
          args: { size: newSize },
        }),
      );
    }

    detail.size = newSize;
  }
}
