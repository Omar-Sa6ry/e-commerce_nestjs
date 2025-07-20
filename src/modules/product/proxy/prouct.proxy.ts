import { NotFoundException } from '@nestjs/common';
import { ProductResponse, ProductsResponse } from '../dtos/productResponse.dto';
import { FindProductInput } from '../inputs/findProduct.input';
import { RedisService } from 'src/common/redis/redis.service';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

export class ProductProxy {
  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

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

    this.redisService.set(`product:${product.id}`, product);

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

    const where = this.buildFindAllWhereClause(findProductInput);
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

    Promise.all(
      Object.entries(productsHash).map(
        ([field, value]) => this.redisService.hSet(cacheKey, field, value),
        this.redisService.expire(cacheKey, 3600),
      ),
    );

    return {
      items: products,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
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
}
