import { Injectable } from '@nestjs/common';
import { OrderItem } from '../entities/orderItem.entity';

@Injectable()
export class OrderItemFactory {
  static create(
    orderId: string,
    detailsId: string,
    quantity: number,
    price: number,
  ): OrderItem {
    const item = new OrderItem();
    item.orderId = orderId;
    item.detailsId = detailsId;
    item.quantity = quantity;
    item.price = price;
    return item;
  }
}
