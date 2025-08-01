import { Cart } from '../entities/cart.entity';

export interface ICalculationStrategy {
  calculate(cart: Cart): Promise<number>;
}
