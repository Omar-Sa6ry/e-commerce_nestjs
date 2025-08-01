import { CartService } from "../cart.service";
import { CartItemResponse } from "../dtos/cartItem.dto";
import { ICartCommand } from "../interfaces/ICartCommand.interface";

export class UpdateQuantityCommand implements ICartCommand {
  constructor(
    private readonly cartService: CartService,
    private readonly userId: string,
    private readonly cartItemId: string,
    private readonly quantity: number,
  ) {}

  async execute(): Promise<CartItemResponse> {
    return this.cartService.updateQuantity(
      this.userId,
      this.cartItemId,
      this.quantity,
    );
  }
}
