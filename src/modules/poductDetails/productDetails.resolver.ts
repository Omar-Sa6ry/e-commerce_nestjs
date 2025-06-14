import {
  Resolver,
  Mutation,
  Args,
  Query,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CreateDetailInput } from './inputs/createProductDetails.input';
import { UpdateProductDetailsInput } from './inputs/updateProductDetails.input';
import { Details } from './entity/productDetails.entity';
import { Permission, Role } from '../../common/constant/enum.constant';
import { Auth } from 'src/common/decerator/auth.decerator';
import { FindProductDetailsInput } from './inputs/findProductDetails.input';
import { Color } from '../color/entity/color.entity';
import { CurrentUser } from 'src/common/decerator/currentUser.decerator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { Product } from '../product/entities/product.entity';
import { ProductDetailsService } from './productDetails.service';
import {
  ProductDetailResponse,
  ProductDetailsResponse,
} from './dto/productDetailsResponse.dto';

@Resolver(() => Details)
export class ProductDetailsResolver {
  constructor(private readonly productDetailsService: ProductDetailsService) {}

  @Mutation(() => ProductDetailResponse)
  @Auth([Role.COMPANY], [Permission.CREATE_PRODUCT_DETAILS])
  createProductDetail(
    @CurrentUser() user: CurrentUserDto,
    @Args('createDetailInput') createDetailInput: CreateDetailInput,
  ): Promise<ProductDetailResponse> {
    return this.productDetailsService.add(createDetailInput, user.id);
  }

  @Query(() => ProductDetailsResponse)
  getAllProductDetails(
    @Args('findProductDetailsInput', { nullable: true })
    findProductDetailsInput?: FindProductDetailsInput,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<ProductDetailsResponse> {
    return this.productDetailsService.findAll(
      findProductDetailsInput,
      page,
      limit,
    );
  }

  @Query(() => ProductDetailResponse)
  getProductDetailById(@Args('id') id: string): Promise<ProductDetailResponse> {
    return this.productDetailsService.findOne(id);
  }

  @Mutation(() => ProductDetailResponse)
  @Auth([Role.COMPANY], [Permission.UPDATE_PRODUCT_DETAILS])
  updateProductDetail(
    @CurrentUser() user: CurrentUserDto,
    @Args('updateProductDetailsInput')
    updateProductDetailsInput: UpdateProductDetailsInput,
  ): Promise<ProductDetailResponse> {
    return this.productDetailsService.update(
      updateProductDetailsInput,
      user.id,
    );
  }

  @Mutation(() => ProductDetailResponse)
  @Auth([Role.COMPANY], [Permission.DELETE_PRODUCT_DETAILS])
  deleteProductDetail(
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: string,
  ): Promise<ProductDetailResponse> {
    return this.productDetailsService.remove(id, user.id);
  }

  @ResolveField(() => Product)
  product(@Parent() detail: Details): Promise<Product> {
    return this.productDetailsService.getProductForDetail(detail.id);
  }

  @ResolveField(() => Product)
  color(@Parent() detail: Details): Promise<Color> {
    return this.productDetailsService.findColorsFromDetailsId(detail.id);
  }
}
