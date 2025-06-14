import {
  Between,
  DataSource,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entity/category.entity';
import { Company } from '../company/entity/company.entity';
import { User } from '../users/entity/user.entity';
import { I18nService } from 'nestjs-i18n';
import { ProductResponse, ProductsResponse } from './dtos/productResponse.dto';
import { UploadService } from './../../common/upload/upload.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductInput } from './inputs/createProduct.input';
import { Image } from './entities/image.entity';
import { RedisService } from 'src/common/redis/redis.service';
import { PubSub } from 'graphql-subscriptions';
import { UpdateProductInput } from './inputs/updateProduct.input';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { FindProductInput } from './inputs/findProduct.input';
import { Details } from '../poductDetails/entity/productDetails.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(
    private readonly i18n: I18nService,
    private dataSource: DataSource,
    private readonly uploadService: UploadService,
    private readonly redisService: RedisService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Details)
    private readonly pDetailsRepository: Repository<Details>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
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
      const [existedProduct, category, user] = await Promise.all([
        this.productRepository.findOne({
          where: { name: createProductInput.name },
        }),
        this.categoryRepository.findOne({
          where: { id: createProductInput.categoryId },
        }),

        this.userRepository.findOne({
          where: { id: userId },
        }),
      ]);

      if (existedProduct)
        throw new NotFoundException(
          await this.i18n.t('product.EXISTED', {
            args: { name: createProductInput.name },
          }),
        );

      if (!category)
        throw new NotFoundException(
          await this.i18n.t('category.NOT_FOUND', {
            args: { id: createProductInput.categoryId },
          }),
        );

      if (!user)
        throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));

      if (createProductInput.images.length > 5)
        throw new NotFoundException(
          await this.i18n.t('product.MAX_IMAGE', {
            args: { id: createProductInput.images },
          }),
        );

      const product = await queryRunner.manager.create(
        this.productRepository.target,
        {
          name: createProductInput.name,
          description: createProductInput.description,
          price: createProductInput.price,
          categoryId: createProductInput.categoryId,
          companyId: user.companyId,
          userId,
        },
      );
      await queryRunner.manager.save(product);

      const details = await Promise.all(
        createProductInput.details.map((detail) =>
          queryRunner.manager.create(this.pDetailsRepository.target, {
            ...detail,
            productId: product.id,
          }),
        ),
      );
      await queryRunner.manager.save(details);

      await Promise.all(
        createProductInput.images.map(async (imageInput) => {
          const imageUrl = await this.uploadService.uploadImage(
            { image: imageInput.image },
            'products',
          );
          const imageEntity = queryRunner.manager.create(
            this.imageRepository.target,
            {
              path: imageUrl,
              productId: product.id,
            },
          );
          await queryRunner.manager.save(imageEntity);
        }),
      );

      await queryRunner.commitTransaction();

      const result: ProductResponse = {
        statusCode: 201,
        data: product,
        message: await this.i18n.t('product.CREATED'),
      };

      this.redisService.set(`product:${product.id}`, product);
      await this.pubSub.publish('productCreated', {
        productCreated: result,
      });

      return result;
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

    const [products, total] = await this.productRepository.findAndCount({
      where,
      relations: ['category', 'company', 'user', 'images', 'details'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (products.length === 0) {
      throw new NotFoundException(await this.i18n.t('product.NOT_FOUNDS'));
    }

    return {
      items: products,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'company', 'user', 'images', 'details'],
    });
    if (!product)
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', { args: { id } }),
      );

    this.redisService.set(`product:${product.id}`, product);

    return { data: product };
  }

  async update(
    updateProductInput: UpdateProductInput,
  ): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id: updateProductInput.id },
    });
    if (!product)
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', {
          args: { id: updateProductInput.id },
        }),
      );

    Object.assign(product, updateProductInput);
    this.redisService.set(`product:${product.id}`, product);

    return {
      data: await this.productRepository.save(product),
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
      const product = await queryRunner.manager.findOne(
        this.productRepository.target,
        {
          where: { id },
        },
      );

      if (!product)
        throw new NotFoundException(
          await this.i18n.t('product.NOT_FOUND', { args: { id } }),
        );

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (product.companyId !== user.companyId)
        throw new BadRequestException(
          await this.i18n.t('product.NOT_PERMISSION', { args: { id } }),
        );

      const images = await this.imageRepository.find({
        where: { productId: product.id },
      });

      await Promise.all(
        images.map(async (image) => {
          await this.uploadService.deleteImage(image.path);
        }),
      );

      await this.productRepository.remove(product);

      await queryRunner.commitTransaction();

      this.redisService.del(`product:${id}`);
      await this.pubSub.publish('productDeleted', {
        productDeleted: { id },
      });

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
}
