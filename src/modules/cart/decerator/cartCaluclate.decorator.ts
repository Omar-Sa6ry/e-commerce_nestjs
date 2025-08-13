import { QueryRunner } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cartItem.enitty';

export class CartCalculationDecorator {
  async recalculateWithLogging(
    queryRunner: QueryRunner,
    cart: Cart,
  ): Promise<void> {
    const items = await queryRunner.manager.find(CartItem, {
      where: { cartId: cart.id },
    });

    cart.totalPrice = items.reduce(
      (acc, cart) => acc + parseFloat(cart.totalPrice.toString()),
      0,
    );
    await queryRunner.manager.save(cart);
  }
}
