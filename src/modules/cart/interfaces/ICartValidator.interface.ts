import { Cart } from '../entities/cart.entity';

export interface CartValidator {
  setNext(validator: CartValidator): CartValidator;
  validate(cart: Cart): Promise<void>;
}
