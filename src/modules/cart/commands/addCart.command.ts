import { CartService } from "../cart.service";
import { CartResponse } from "../dtos/cartResponse";
import { CartItemInput } from "../inputs/cartItem.input";
import { ICartCommand } from "../interfaces/ICartCommand.interface";

export class AddToCartCommand implements ICartCommand {
  constructor(
    private readonly cartService: CartService,
    private readonly userId: string,
    private readonly input: CartItemInput,
  ) {}

  async execute(): Promise<CartResponse> {
    return this.cartService.addToCart(this.userId, this.input);
  }
}
