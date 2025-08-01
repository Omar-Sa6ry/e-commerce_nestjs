import { CartItemResponse } from "../dtos/cartItem.dto";
import { CartResponse } from "../dtos/cartResponse";
import { TotalCartsResponse } from "../dtos/totalCarts.dto";

export interface ICartCommand {
  execute(): Promise<CartResponse | CartItemResponse | TotalCartsResponse>;
}
