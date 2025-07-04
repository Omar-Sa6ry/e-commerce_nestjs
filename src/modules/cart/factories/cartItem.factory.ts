import { CartItem } from '../entities/cartItem.enitty';
import { CartItemInput } from '../inputs/cartItem.input';

export class CartItemFactory {
  static create(cartId: string, input: CartItemInput, price: number): CartItem {
    const item = new CartItem();
    item.productId = input.productId;
    item.detailsId = input.detailsId;
    item.quantity = input.quantity;
    item.totalPrice = price * input.quantity;
    item.cartId = cartId;
    return item;
  }
}
