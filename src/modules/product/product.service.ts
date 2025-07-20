import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { PUB_SUB } from 'src/common/pubsup/pubSub.module';
import { Repository } from 'typeorm';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { UploadService } from 'src/common/upload/upload.service';
import { RedisService } from 'src/common/redis/redis.service';
import { Transactional } from 'src/common/decerator/transactional.decerator';
import { ProductProxy } from './proxy/prouct.proxy';
import { Details } from '../poductDetails/entity/productDetails.entity';
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
  private proxy: ProductProxy;

  constructor(
    private readonly i18n: I18nService,
    private readonly uploadService: UploadService,
    private readonly redisService: RedisService,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Details)
    private readonly productDetailsRepository: Repository<Details>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {
    this.proxy = new ProductProxy(
      this.i18n,
      this.redisService,
      this.productRepository,
    );
  }

  @Transactional()
  async create(
    createProductInput: CreateProductInput,
    userId: string,
  ): Promise<ProductResponse> {
    const user = await this.validateCreateProductInput(
      createProductInput,
      userId,
    );

    const product = await this.createProductWithDetails(
      createProductInput,
      userId,
      user.companyId,
    );

    await this.handlePostCreationTasks(product);

    return this.buildProductResponse(
      product,
      201,
      await this.i18n.t('product.CREATED'),
    );
  }

  async findAll(
    findProductInput?: FindProductInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<ProductsResponse> {
    return this.proxy.findAll(findProductInput, page, limit);
  }

  async findOne(id: string): Promise<ProductResponse> {
    return this.proxy.findOne(id);
  }

  @Transactional()
  async update(
    updateProductInput: UpdateProductInput,
  ): Promise<ProductResponse> {
    const product = await this.validateAndGetProduct(updateProductInput.id);
    Object.assign(product, updateProductInput);

    await this.productRepository.save(product);

    this.redisService.del(`product:${product.id}`);
    this.redisService.set(`product:${product.id}`, product);

    return {
      data: product,
      message: await this.i18n.t('product.UPDATED', {
        args: { name: product.name },
      }),
    };
  }

  @Transactional()
  async remove(id: string, userId: string): Promise<ProductResponse> {
    const product = await this.validateProductForDeletion(id, userId);

    await this.deleteProductImages(product.id);

    await this.handlePostDeletionTasks(id);
    this.redisService.del(`product:${product.id}`);

    return {
      data: null,
      message: await this.i18n.t('product.DELETED', { args: { id } }),
    };
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
    input: CreateProductInput,
    userId: string,
    companyId: string,
  ): Promise<Product> {
    const product = ProductFactory.create(input, companyId, userId);
    await this.productRepository.manager.save(product);

    const details = input.details.map((detail) =>
      ProductDetailsFactory.create({ ...detail, productId: product.id }),
    );
    await this.productDetailsRepository.manager.save(details);

    await this.createProductImages(input.images, product.id);

    return product;
  }

  private async createProductImages(
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
        await this.imageRepository.save(imageEntity);
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
    id: string,
    userId: string,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product)
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', { args: { id } }),
      );

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
