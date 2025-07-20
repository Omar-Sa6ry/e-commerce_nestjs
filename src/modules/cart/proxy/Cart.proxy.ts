import { Repository } from "typeorm";
import { Cart } from "../entities/cart.entity";

export class CartRepositoryProxy {
  constructor(private readonly cartRepository: Repository<Cart>) {}

  async findOneWithItems(where: any): Promise<Cart> {
    return this.cartRepository.findOne({
      where,
      relations: ['cartItems'],
    });
  }

  async findOneFullCart(where: any): Promise<Cart> {
    return this.cartRepository.findOne({
      where,
      relations: ['cartItems', 'cartItems.product', 'cartItems.details'],
    });
  }
}