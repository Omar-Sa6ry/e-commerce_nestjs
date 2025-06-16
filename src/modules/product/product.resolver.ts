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
import { Inject } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { Permission, Role } from '../../common/constant/enum.constant';
import { Auth } from 'src/common/decerator/auth.decerator';
import { FindProductInput } from './inputs/findProduct.input';
import { CurrentUser } from 'src/common/decerator/currentUser.decerator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { ProductPubsupResponse } from './dtos/product.subscription';
import { PUB_SUB } from 'src/common/pubsup/pubSub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ProductIdInput } from './inputs/product.input';
import { ProductDataLoader } from './dataLoader/product.loader';
import { Category } from '../category/entity/category.entity';
import { Company } from '../company/entity/company.entity';
import { Image } from './entities/image.entity';
import { User } from '../users/entity/user.entity';
import { Details } from '../poductDetails/entity/productDetails.entity';

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly productLoader: ProductDataLoader,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
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
  async getProductById(
    @Args('productId') productId: ProductIdInput,
  ): Promise<ProductResponse> {
    return this.productService.findOne(productId.id);
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
    @Args('productId') productId: ProductIdInput,
  ): Promise<ProductResponse> {
    return this.productService.remove(productId.id, user.id);
  }

  @Subscription(() => ProductPubsupResponse, {
    name: 'productCreated',
  })
  productCreated() {
    return this.pubSub.asyncIterator('productCreated');
  }

  @Subscription(() => String, {
    name: 'productDeleted',
    resolve: (value) => value.productDeleted.id,
  })
  productDeleted() {
    return this.pubSub.asyncIterator('productDeleted');
  }

  @ResolveField('category', () => Category)
  async category(@Parent() product: Product): Promise<Category> {
    return this.productLoader.batchCategories.load(product.categoryId);
  }

  @ResolveField('company', () => Company)
  async company(@Parent() product: Product): Promise<Company> {
    return this.productLoader.batchCompanies.load(product.companyId);
  }

  @ResolveField('user', () => User)
  async user(@Parent() product: Product): Promise<User> {
    return this.productLoader.batchUsers.load(product.userId);
  }

  @ResolveField('images', () => [Image])
  async images(@Parent() product: Product): Promise<Image[]> {
    return this.productLoader.batchImages.load(product.id);
  }

  @ResolveField('details', () => [Details])
  async details(@Parent() product: Product): Promise<Details[]> {
    return this.productLoader.batchDetails.load(product.id);
  }
}
