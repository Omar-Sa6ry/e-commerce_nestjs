import { CreateOrderResponse } from "../dtos/createOrderResponse.dto";

export interface IOrderCommand {
  execute(): Promise<CreateOrderResponse>;
}
