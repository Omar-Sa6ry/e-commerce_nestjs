import {
  Between,
  DataSource,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { PUB_SUB } from 'src/common/pubsup/pubSub.module';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { UploadService } from 'src/common/upload/upload.service';
import { RedisService } from 'src/common/redis/redis.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ProductFactory } from '../product/factories/product.factory';
import { ProductDetailsFactory } from '../poductDetails/factory/productDetails.factory';
import { ImageFactory } from '../product/factories/image.factory';
import { Product } from '../product/entities/product.entity';
import { CreateProductInput } from '../product/inputs/createProduct.input';
import { FindProductInput } from './inputs/findProduct.input';
import { UpdateProductInput } from './inputs/updateProduct.input';
import { Category } from '../category/entity/category.entity';
import { User } from '../users/entity/user.entity';
import { Image } from '../product/entities/image.entity';
import {
  ProductResponse,
  ProductsResponse,
} from '../product/dtos/productResponse.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly i18n: I18nService,
    private dataSource: DataSource,
    private readonly uploadService: UploadService,
    private readonly redisService: RedisService,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async create(
    createProductInput: CreateProductInput,
    userId: string,
  ): Promise<ProductResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.validateCreateProductInput(
        createProductInput,
        userId,
      );

      const product = await this.createProductWithDetails(
        queryRunner,
        createProductInput,
        userId,
        user.companyId,
      );

      await queryRunner.commitTransaction();
      await this.handlePostCreationTasks(product);

      return this.buildProductResponse(
        product,
        201,
        await this.i18n.t('product.CREATED'),
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    findProductInput?: FindProductInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<ProductsResponse> {
    const where = this.buildFindAllWhereClause(findProductInput);
    const [products, total] = await this.productRepository.findAndCount({
      where,
      relations: ['category', 'company', 'user', 'images', 'details'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (products.length === 0)
      throw new NotFoundException(await this.i18n.t('product.NOT_FOUNDS'));

    return this.buildProductsResponse(products, total, page, limit);
  }

  async findOne(id: string): Promise<ProductResponse> {
    const cachedProduct = await this.redisService.get(`product:${id}`);

    if (typeof cachedProduct === 'string')
      return { data: JSON.parse(cachedProduct) };

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'company', 'user', 'images', 'details'],
    });

    if (!product) {
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', { args: { id } }),
      );
    }

    this.redisService.set(`product:${product.id}`, JSON.stringify(product));

    return { data: product };
  }

  async update(
    updateProductInput: UpdateProductInput,
  ): Promise<ProductResponse> {
    const product = await this.validateAndGetProduct(updateProductInput.id);
    Object.assign(product, updateProductInput);

    await this.productRepository.save(product);
    this.redisService.set(`product:${product.id}`, product);

    return {
      data: product,
      message: await this.i18n.t('product.UPDATED', {
        args: { name: product.name },
      }),
    };
  }

  async remove(id: string, userId: string): Promise<ProductResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this.validateProductForDeletion(
        queryRunner,
        id,
        userId,
      );

      this.deleteProductImages(product.id);
      await queryRunner.manager.remove(product);
      await queryRunner.commitTransaction();

      await this.handlePostDeletionTasks(id);

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

  private async validateCreateProductInput(
    input: CreateProductInput,
    userId: string,
  ): Promise<User> {
    const [existedProduct, category, user] = await Promise.all([
      this.productRepository.findOne({ where: { name: input.name } }),
      this.categoryRepository.findOne({ where: { id: input.categoryId } }),
      this.userRepository.findOne({ where: { id: userId } }),
    ]);

    if (existedProduct) {
      throw new NotFoundException(
        await this.i18n.t('product.EXISTED', {
          args: { name: input.name },
        }),
      );
    }

    if (!category) {
      throw new NotFoundException(
        await this.i18n.t('category.NOT_FOUND', {
          args: { id: input.categoryId },
        }),
      );
    }

    if (!user) {
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));
    }

    if (input.images.length > 5) {
      throw new NotFoundException(
        await this.i18n.t('product.MAX_IMAGE', {
          args: { id: input.images },
        }),
      );
    }

    return user;
  }

  private async createProductWithDetails(
    queryRunner: any,
    input: CreateProductInput,
    userId: string,
    companyId: string,
  ): Promise<Product> {
    const product = ProductFactory.create(input, companyId, userId);
    await queryRunner.manager.save(product);

    const details = input.details.map((detail) =>
      ProductDetailsFactory.create({ ...detail, productId: product.id }),
    );
    await queryRunner.manager.save(details);

    await this.createProductImages(queryRunner, input.images, product.id);

    return product;
  }

  private async createProductImages(
    queryRunner: any,
    images: any[],
    productId: string,
  ): Promise<void> {
    await Promise.all(
      images.map(async (imageInput) => {
        const imageUrl = await this.uploadService.uploadImage(
          { image: imageInput.image },
          'products',
        );
        const imageEntity = ImageFactory.create(imageUrl, productId);
        await queryRunner.manager.save(imageEntity);
      }),
    );
  }

  private async handlePostCreationTasks(product: Product): Promise<void> {
    await Promise.all([
      this.redisService.set(`product:${product.id}`, product),
      this.pubSub.publish('productCreated', {
        productCreated: {
          statusCode: 201,
          message: await this.i18n.t('product.CREATED'),
          data: product,
        },
      }),
    ]);
  }

  private buildFindAllWhereClause(
    findProductInput?: FindProductInput,
  ): FindOptionsWhere<Product> {
    const where: FindOptionsWhere<Product> = {};

    if (findProductInput) {
      if (findProductInput.name) {
        where.name = ILike(`%${findProductInput.name.trim()}%`);
      }

      if (findProductInput.categoryId) {
        where.category = { id: findProductInput.categoryId };
      }

      if (findProductInput.companyId) {
        where.company = { id: findProductInput.companyId };
      }

      if (
        typeof findProductInput.priceMin === 'number' ||
        typeof findProductInput.priceMax === 'number'
      ) {
        const min = findProductInput.priceMin ?? 0;
        const max = findProductInput.priceMax ?? Number.MAX_SAFE_INTEGER;
        where.price = Between(min, max);
      }
    }

    return where;
  }

  private buildProductsResponse(
    products: Product[],
    total: number,
    page: number,
    limit: number,
  ): ProductsResponse {
    return {
      items: products,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async validateAndGetProduct(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product)
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', {
          args: { id },
        }),
      );

    return product;
  }

  private async validateProductForDeletion(
    queryRunner: any,
    id: string,
    userId: string,
  ): Promise<Product> {
    const product = await queryRunner.manager.findOne(Product, {
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', { args: { id } }),
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (product.companyId !== user.companyId) {
      throw new BadRequestException(
        await this.i18n.t('product.NOT_PERMISSION', { args: { id } }),
      );
    }

    return product;
  }

  private async deleteProductImages(id: string): Promise<void> {
    const images = await this.imageRepository.find({
      where: { productId: id },
    });

    await Promise.all(
      images.map(async (image) => {
        await this.uploadService.deleteImage(image.path);
      }),
    );
  }

  private async handlePostDeletionTasks(id: string): Promise<void> {
    await Promise.all([
      this.redisService.del(`product:${id}`),
      this.pubSub.publish('productDeleted', { productDeleted: { id } }),
    ]);
  }

  private buildProductResponse(
    product: Product,
    statusCode: number,
    message: string,
  ): ProductResponse {
    return {
      statusCode,
      data: product,
      message,
    };
  }
}
