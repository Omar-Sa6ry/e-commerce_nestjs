import { Injectable } from '@nestjs/common';
import { Cart } from '../entities/cart.entity';
import { ICalculationStrategy } from '../interfaces/ICartStrategy.interface';

@Injectable()
export class DefaultCalculationStrategy implements ICalculationStrategy {
  calculateItemTotal(price: number | string, quantity: number): number {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

    const total = numericPrice * quantity;
    return parseFloat(total.toFixed(2));
  }

  async calculate(cart: Cart): Promise<number> {
    if (!cart.cartItems || cart.cartItems.length === 0) {
      return 0;
    }

    return cart.cartItems.reduce((total, item) => {
      try {
        const itemTotal = this.calculateItemTotal(
          item.product?.price || 0,
          item.quantity,
        );
        return total + itemTotal;
      } catch (error) {
        console.error(`Error calculating item total: ${error.message}`);
        return total;
      }
    }, 0);
  }
}
