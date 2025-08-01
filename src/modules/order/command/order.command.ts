import { PaymentMethod } from 'src/common/constant/enum.constant';
import { OrderFacadeService } from '../fascade/order.fascade';
import { IOrderCommand } from '../interfaces/IOrderCommand.interface';
import { CreateOrderResponse } from '../dtos/createOrderResponse.dto';

export class CreateOrderFromCartCommand implements IOrderCommand {
  constructor(
    private facade: OrderFacadeService,
    private userId: string,
    private addressId: string,
    private paymentMethod: PaymentMethod,
    private delevaryPrice: number,
    private couponId?: string,
  ) {}

  async execute(): Promise<CreateOrderResponse> {
    return this.facade.createOrderFromCart(
      this.userId,
      this.addressId,
      this.paymentMethod,
      this.delevaryPrice,
      this.couponId,
    );
  }
}

export class CreateOrderFromProductsCommand implements IOrderCommand {
  constructor(
    private facade: OrderFacadeService,
    private userId: string,
    private addressId: string,
    private paymentMethod: PaymentMethod,
    private detailsId: string,
    private quantity: number,
    private delevaryPrice: number,
    private couponId?: string,
  ) {}

  async execute(): Promise<CreateOrderResponse> {
    return this.facade.createOrderFromProducts(
      this.userId,
      this.addressId,
      this.paymentMethod,
      this.detailsId,
      this.quantity,
      this.delevaryPrice,
      this.couponId,
    );
  }
}
