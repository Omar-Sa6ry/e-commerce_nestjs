import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { Details } from './entity/productDetails.entity';
import { User } from '../users/entity/user.entity';
import { ProductResponse } from '../product/dtos/productResponse.dto';
import { CreateDetailInput } from './inputs/createProductDetails.input';
import { FindProductDetailsInput } from './inputs/findProductDetails.input';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { UpdateProductDetailsInput } from './inputs/updateProductDetails.input';
import { Size } from 'src/common/constant/enum.constant';
import {
  ProductDetailResponse,
  ProductDetailsResponse,
} from './dto/productDetailsResponse.dto';
import { Color } from '../color/entity/color.entity';

@Injectable()
export class ProductDetailsService {
  constructor(
    private readonly i18n: I18nService,
    private dataSource: DataSource,

    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Details)
    private readonly pDetailsRepository: Repository<Details>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Add

  async add(
    createDetailInput: CreateDetailInput,
    userId: string,
  ): Promise<ProductDetailResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.validateProductAndUser(
        createDetailInput.productId,
        createDetailInput.colorId,
        userId,
      );

      const existingDetail = await this.findExistingDetail(createDetailInput);

      if (existingDetail) {
        const updatedDetail = await this.updateDetailQuantity(
          queryRunner,
          existingDetail,
          createDetailInput.quantity,
        );

        await queryRunner.commitTransaction();

        return this.buildSuccessResponse(
          updatedDetail,
          'productDetails.ADDQUANTITY',
          { quantity: updatedDetail.quantity },
        );
      }

      const newDetail = await this.createNewDetail(
        queryRunner,
        createDetailInput,
        userId,
      );

      await queryRunner.commitTransaction();

      return this.buildSuccessResponse(newDetail, 'product.CREATED');
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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
    const allDetails = await this.pDetailsRepository.find({
      where: { productId: createDetailInput.productId },
    });

    return allDetails.find(
      (detail) =>
        detail.colorId === createDetailInput.colorId &&
        detail.size === createDetailInput.size,
    );
  }

  private async updateDetailQuantity(
    queryRunner: QueryRunner,
    detail: Details,
    quantityToAdd: number,
  ) {
    detail.quantity += quantityToAdd;
    await queryRunner.manager.save(detail);
    return detail;
  }

  private async createNewDetail(
    queryRunner: QueryRunner,
    createDetailInput: CreateDetailInput,
    userId: string,
  ) {
    const detail = queryRunner.manager.create(this.pDetailsRepository.target, {
      ...createDetailInput,
      userId,
    });

    await queryRunner.manager.save(detail);
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

  // Find All

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

    const [details, total] = await this.pDetailsRepository.findAndCount({
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

  async findOne(id: string): Promise<ProductDetailResponse> {
    const detail = await this.pDetailsRepository.findOne({
      where: { id },
    });
    if (!detail)
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND', { args: { id } }),
      );

    return { data: detail };
  }

  // Update

  async update(
    updateProductInput: UpdateProductDetailsInput,
    userId: string,
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

    await this.pDetailsRepository.save(detail);

    return {
      data: detail,
      message: await this.i18n.t('productDetails.UPDATED', {
        args: { id: updateProductInput.id },
      }),
    };
  }

  private async findDetail(id: string): Promise<Details> {
    const detail = await this.pDetailsRepository.findOne({
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
    const existingDetail = await this.pDetailsRepository.findOneBy({
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
    const existingDetail = await this.pDetailsRepository.findOneBy({
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

  // Remove

  async remove(id: string, userId: string): Promise<ProductDetailResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const detail = await queryRunner.manager.findOne(
        this.pDetailsRepository.target,
        {
          where: { id },
          relations: ['product'],
        },
      );

      if (!detail)
        throw new NotFoundException(
          await this.i18n.t('productDetails.NOT_FOUND', { args: { id } }),
        );

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (detail.product.companyId !== user.companyId)
        throw new BadRequestException(
          await this.i18n.t('product.NOT_PERMISSION', { args: { id } }),
        );

      await this.pDetailsRepository.remove(detail);

      await queryRunner.commitTransaction();

      return {
        data: null,
        message: await this.i18n.t('product.DELETED', { args: { id } }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // find product from detail

  async getProductForDetail(detailId: string): Promise<Product> {
    const detail = await this.pDetailsRepository.findOne({
      where: { id: detailId },
      relations: ['product'],
    });

    if (!detail) {
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND', {
          args: { id: detailId },
        }),
      );
    }

    return detail.product;
  }

  async findColorsFromDetailsId(detailId: string): Promise<Color> {
    const detail = await this.pDetailsRepository.findOne({
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
}
