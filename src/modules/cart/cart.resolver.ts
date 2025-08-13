import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
  Int,
} from '@nestjs/graphql';
import { CartService } from './cart.service';
import { CartItemInput } from './inputs/cartItem.input';
import { CartResponse } from './dtos/cartResponse';
import { CartItemsResponse } from './dtos/cartItem.dto';
import { TotalCartsResponse } from './dtos/totalCarts.dto';
import { CartItemResponse } from './dtos/cartItem.dto';
import { Permission, Role } from '../../common/constant/enum.constant';
import { Auth } from 'src/common/decorator/auth.decorator';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem.enitty';
import { CartIdInput } from './inputs/cartId.input';
import { CartItemIdInput } from './inputs/cartItemId.input';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Mutation(() => CartResponse)
  @Auth([Role.USER], [Permission.CREATE_CART])
  async addToCart(
    @CurrentUser() user: CurrentUserDto,
    @Args('cartItemInput') cartItemInput: CartItemInput,
  ): Promise<CartResponse> {
    return this.cartService.addToCart(user.id, cartItemInput);
  }

  @Query(() => CartItemsResponse)
  @Auth([Role.USER], [Permission.VIEW_CART])
  async findCartItems(
    @CurrentUser() user: CurrentUserDto,
    @Args('cartId') cartId: CartIdInput,
  ): Promise<CartItemsResponse> {
    return this.cartService.findItems(cartId.cartId, user.id);
  }

  @Mutation(() => CartItemResponse)
  @Auth([Role.USER], [Permission.UPDATE_CART])
  async updateCartItemQuantity(
    @CurrentUser() user: CurrentUserDto,
    @Args('cartItemId') cartItemId: CartItemIdInput,
    @Args('quantity', { type: () => Int }) quantity: number,
  ): Promise<CartItemResponse> {
    return this.cartService.updateQuantity(
      user.id,
      cartItemId.cartItemId,
      quantity,
    );
  }

  @Mutation(() => CartResponse)
  @Auth([Role.USER], [Permission.UPDATE_CART])
  async emptyCart(@CurrentUser() user: CurrentUserDto): Promise<CartResponse> {
    return this.cartService.deleteCartItems(user.id);
  }

  @Mutation(() => CartResponse)
  @Auth([Role.USER], [Permission.DELETE_CART])
  async deleteCart(
    @CurrentUser() user: CurrentUserDto,
    @Args('cartId') cartId: CartIdInput,
  ): Promise<CartResponse> {
    return this.cartService.deleteCart(user.id, cartId.cartId);
  }

  @Query(() => TotalCartsResponse)
  @Auth([Role.USER], [Permission.VIEW_CART])
  async getCartTotal(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<TotalCartsResponse> {
    return this.cartService.checkTotalCart(user.id);
  }

  @ResolveField(() => [CartItem])
  async items(@Parent() cart: Cart): Promise<CartItem[]> {
    return this.cartService.getCartItemsByCartId(cart.id);
  }
}
