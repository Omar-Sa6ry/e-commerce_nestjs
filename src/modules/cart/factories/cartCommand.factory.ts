import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CartItemInput } from '../inputs/cartItem.input';
import { CartService } from '../cart.service';
import { AddToCartCommand } from '../commands/addCart.command';
import { UpdateQuantityCommand } from '../commands/updateQuantity.command';

@Injectable()
export class CartCommandFactory {
  constructor(
    @Inject(forwardRef(() => CartService))
    private readonly cartService: CartService,
  ) {}

  createAddToCartCommand(userId: string, input: CartItemInput) {
    return new AddToCartCommand(this.cartService, userId, input);
  }

  createUpdateQuantityCommand(
    userId: string,
    cartItemId: string,
    quantity: number,
  ) {
    return new UpdateQuantityCommand(
      this.cartService,
      userId,
      cartItemId,
      quantity,
    );
  }
}
