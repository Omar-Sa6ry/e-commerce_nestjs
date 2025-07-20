import { Cart } from "../entities/cart.entity";

export interface ICartValidator {
  validate(cart: Cart): Promise<void>;
}
