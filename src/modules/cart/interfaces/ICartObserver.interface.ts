import { Cart } from '../entities/cart.entity';

export interface ICartObserver {
  onCartUpdated(cart: Cart): Promise<void>;
}
