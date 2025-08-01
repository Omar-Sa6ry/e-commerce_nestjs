import { Order } from "../entities/order.entity";

export interface IOrderObserver {
  notify(order: Order, message: string): Promise<void>;
}
