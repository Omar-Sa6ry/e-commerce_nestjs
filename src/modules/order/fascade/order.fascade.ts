import { Injectable } from '@nestjs/common';
import { OrderProcessingService } from '../services/orderProcessing.service';
import { Transactional } from 'src/common/decorator/transactional.decorator';
import { PaymentMethod, QueuesNames } from 'src/common/constant/enum.constant';
import { CreateOrderResponse } from '../dtos/createOrderResponse.dto';
import { I18nService } from 'nestjs-i18n';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DelevaryPrice } from 'src/common/constant/messages.constant';
import {
  CreateOrderFromCartCommand,
  CreateOrderFromProductsCommand,
} from '../command/order.command';
import { IOrderCommand } from '../interfaces/IOrderCommand.interface';

@Injectable()
export class OrderFacadeService {
  constructor(
    private readonly i18n: I18nService,
    private readonly orderProcessingService: OrderProcessingService,
    @InjectQueue(QueuesNames.ORDER_PROCESSING) private orderQueue: Queue,
  ) {}

  createCommand(
    type: 'cart' | 'products',
    userId: string,
    addressId: string,
    paymentMethod: PaymentMethod,
    delevaryPrice: number = DelevaryPrice,
    detailsId?: string,
    quantity?: number,
    couponId?: string,
  ): IOrderCommand {
    if (type === 'cart') {
      return new CreateOrderFromCartCommand(
        this,
        userId,
        addressId,
        paymentMethod,
        delevaryPrice,
        couponId,
      );
    } else {
      return new CreateOrderFromProductsCommand(
        this,
        userId,
        addressId,
        paymentMethod,
        detailsId,
        quantity,
        delevaryPrice,
        couponId,
      );
    }
  }

  @Transactional()
  async createOrderFromCart(
    userId: string,
    addressId: string,
    paymentMethod: PaymentMethod,
    delevaryPrice: number = DelevaryPrice,
    couponId?: string,
  ): Promise<CreateOrderResponse> {
    const user = await this.orderProcessingService.validateUser(userId, true);
    await this.orderProcessingService.validateCart(user);

    this.orderQueue.add(QueuesNames.ORDER_PROCESSING, {
      userId,
      addressId,
      paymentMethod,
      delevaryPrice,
      couponId,
      cartItems: user.cart.cartItems,
    });

    return {
      data: null,
      statusCode: 201,
      message: await this.i18n.t('order.CREATED'),
    };
  }

  @Transactional()
  async createOrderFromProducts(
    userId: string,
    addressId: string,
    paymentMethod: PaymentMethod,
    detailsId: string,
    quantity: number,
    delevaryPrice: number = DelevaryPrice,
    couponId?: string,
  ): Promise<CreateOrderResponse> {
    await this.orderProcessingService.validateUser(userId);
    const details =
      await this.orderProcessingService.validateProductDetails(detailsId);

    this.orderQueue.add(QueuesNames.ORDER_PROCESSING, {
      userId,
      addressId,
      paymentMethod,
      delevaryPrice,
      couponId,
      singleProduct: {
        detailsId,
        quantity,
        productName: details.product.name,
        productPrice: details.product.price,
      },
    });

    return {
      data: null,
      statusCode: 201,
      message: await this.i18n.t('order.CREATED'),
    };
  }
}
