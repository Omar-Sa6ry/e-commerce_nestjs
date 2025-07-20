import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { Color } from '../color/entity/color.entity';
import { ProductDetailsFactory } from './factory/productDetails.factory';
import { Details } from './entity/productDetails.entity';
import { User } from '../users/entity/user.entity';
import { Transactional } from 'src/common/decerator/transactional.decerator';
import { CreateDetailInput } from './inputs/createProductDetails.input';
import {
  ProductDetailResponse,
  ProductDetailsResponse,
} from './dto/productDetailsResponse.dto';
import { FindProductDetailsInput } from './inputs/findProductDetails.input';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { UpdateProductDetailsInput } from './inputs/updateProductDetails.input';
import { Size } from 'src/common/constant/enum.constant';

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
  ) {}

  @Transactional()
  async add(
    createDetailInput: CreateDetailInput,
    userId: string,
  ): Promise<ProductDetailResponse> {
    await this.validateProductAndUser(
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
    queryRunner?: QueryRunner,
  ): Promise<ProductDetailResponse> {
    const detail = await this.findDetail(updateProductInput.id);

    await this.validateProductAndUser(
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

    return {
      data: detail,
      message: await this.i18n.t('productDetails.UPDATED', {
        args: { id: updateProductInput.id },
      }),
    };
  }

  @Transactional()
  async remove(
    id: string,
    userId: string,
  ): Promise<ProductDetailResponse> {

    const detail = await this.productDetailsRepository.findOne( {
      where: { id },
      relations: ['product'],
    });

    if (!detail)
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND', { args: { id } }),
      );

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (detail.product.companyId !== user.companyId)
      throw new BadRequestException(
        await this.i18n.t('product.NOT_PERMISSION', { args: { id } }),
      );

    await this.productDetailsRepository.remove(detail);

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

  private async validateProductAndUser(
    productId: string,
    colorId: string,
    userId: string,
  ) {
    const [product, color, user] = await Promise.all([
      this.productRepository.findOne({ where: { id: productId } }),
      this.colorRepository.findOne({ where: { id: colorId } }),
      this.userRepository.findOne({ where: { id: userId } }),
    ]);

    if (!product)
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', { args: { id: productId } }),
      );

    if (!color)
      throw new NotFoundException(
        await this.i18n.t('color.NOT_FOUND', { args: { id: productId } }),
      );

    if (!user) throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));

    if (user.companyId !== product.companyId) {
      throw new BadRequestException(
        await this.i18n.t('product.NOT_PERMISSION', {
          args: { id: productId },
        }),
      );
    }

    return [product, user] as const;
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

  private async updateDetailQuantity(
    detail: Details,
    quantityToAdd: number,
  ) {
    detail.quantity += quantityToAdd;
    await this.productDetailsRepository.save(detail);
    return detail;
  }

  private async createNewDetail(
    createDetailInput: CreateDetailInput,
  ) {
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
