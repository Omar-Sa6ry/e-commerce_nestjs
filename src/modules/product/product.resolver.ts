import {
  Resolver,
  Mutation,
  Args,
  Query,
  Subscription,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ProductService } from './product.service';
import { ProductResponse, ProductsResponse } from './dtos/productResponse.dto';
import { CreateProductInput } from './inputs/createProduct.input';
import { UpdateProductInput } from './inputs/updateProduct.input';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { Permission, Role } from '../../common/constant/enum.constant';
import { Auth } from 'src/common/decerator/auth.decerator';
import { FindProductInput } from './inputs/findProduct.input';
import { RedisService } from 'src/common/redis/redis.service';
import { ProductDetailsLoader } from '../poductDetails/loader/productDetails.loader';
import { CurrentUser } from 'src/common/decerator/currentUser.decerator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { ProductPubsupResponse } from './dtos/product.subscription';
import { Details } from '../poductDetails/entity/productDetails.entity';

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private readonly redisService: RedisService,
    private readonly productService: ProductService,
    private readonly productDetailsLoader: ProductDetailsLoader,
    @Inject('PUB_SUB') private readonly pubSub: PubSub<any>,
  ) {}

  @Mutation(() => ProductResponse)
  @Auth([Role.COMPANY], [Permission.CREATE_PRODUCT])
  async createProduct(
    @CurrentUser() user: CurrentUserDto,
    @Args('createProductInput') createProductInput: CreateProductInput,
  ): Promise<ProductResponse> {
    return this.productService.create(createProductInput, user.id);
  }

  @Query(() => ProductsResponse)
  async getAllProducts(
    @Args('findProductInput', { nullable: true })
    findProductInput?: FindProductInput,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<ProductsResponse> {
    return this.productService.findAll(findProductInput, page, limit);
  }

  @Query(() => ProductResponse)
  async getProductById(@Args('id') id: string): Promise<ProductResponse> {
    const cachedProduct = await this.redisService.get(`product:${id}`);

    if (cachedProduct instanceof Product) {
      return { data: cachedProduct };
    }

    return this.productService.findOne(id);
  }

  @Mutation(() => ProductResponse)
  @Auth([Role.COMPANY], [Permission.UPDATE_PRODUCT])
  async updateProduct(
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ): Promise<ProductResponse> {
    return this.productService.update(updateProductInput);
  }

  @Mutation(() => ProductResponse)
  @Auth([Role.COMPANY], [Permission.DELETE_PRODUCT])
  async deleteProduct(
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: string,
  ): Promise<ProductResponse> {
    return this.productService.remove(id, user.id);
  }

  @Subscription(() => ProductPubsupResponse, {
    name: 'productCreated',
  })
  productCreated() {
    return this.pubSub.asyncIterableIterator('productCreated');
  }

  @Subscription(() => String, {
    name: 'productDeleted',
    resolve: (value) => value.productDeleted.id,
  })
  productDeleted() {
    return this.pubSub.asyncIterableIterator('productDeleted');
  }

  @ResolveField(() => [Details])
  async details(@Parent() product: Product): Promise<Details[]> {
    return this.productDetailsLoader.load(product.id);
  }
}
