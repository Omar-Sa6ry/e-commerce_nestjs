import { NotFoundException } from '@nestjs/common';
import { ProductResponse, ProductsResponse } from '../dtos/productResponse.dto';
import { FindProductInput } from '../inputs/findProduct.input';
import { RedisService } from 'src/common/redis/redis.service';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import {
  CategorySearchStrategy,
  NameSearchStrategy,
  PriceRangeSearchStrategy,
  ProductSearchContext,
} from '../strategy/product.strategy';
import {
  ProductCacheManager,
  RedisCacheObserver,
} from '../observer/product.observer';

export class ProductProxy {
  private searchContext: ProductSearchContext;
  private cacheManager: ProductCacheManager;

  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    this.searchContext = new ProductSearchContext();
    this.searchContext.addStrategy(new NameSearchStrategy());
    this.searchContext.addStrategy(new CategorySearchStrategy());
    this.searchContext.addStrategy(new PriceRangeSearchStrategy());

    this.cacheManager = new ProductCacheManager();
    this.cacheManager.addObserver(new RedisCacheObserver(redisService));
  }

  async findOne(id: string): Promise<ProductResponse> {
    const cacheKey = `product:${id}`;
    const cachedProduct = await this.redisService.get(cacheKey);

    if (cachedProduct) {
      return { data: cachedProduct };
    }

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'company', 'user', 'images', 'details'],
    });

    if (!product) {
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', { args: { id } }),
      );
    }

    await this.cacheManager.notifyProductUpdated(product);

    return { data: product };
  }

  async findAll(
    findProductInput?: FindProductInput,
    page?: number,
    limit?: number,
  ): Promise<ProductsResponse> {
    const cacheKey = `products:${JSON.stringify({ findProductInput, page, limit })}`;
    const cachedProducts = await this.redisService.hGetAll(cacheKey);

    if (cachedProducts && Object.keys(cachedProducts).length > 0) {
      return {
        items: Object.values(cachedProducts).map((item) => JSON.parse(item)),
        pagination: JSON.parse(cachedProducts.pagination),
      };
    }

    const where = this.searchContext.buildWhereClause(findProductInput);
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

    const productsHash = {};
    products.forEach((product, index) => {
      productsHash[`product_${index}`] = JSON.stringify(product);
    });
    productsHash['pagination'] = JSON.stringify({
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });

    await Promise.all(
      Object.entries(productsHash).map(([field, value]) =>
        this.redisService.hSet(cacheKey, field, value),
      ),
    );
    await this.redisService.expire(cacheKey, 3600);

    return {
      items: products,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
