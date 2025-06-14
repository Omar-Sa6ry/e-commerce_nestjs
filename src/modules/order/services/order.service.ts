import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TrackOrderStatusResponse } from '../dtos/trackOrder.dto';
import { OrderItemsResponse } from '../dtos/orderItemResponse.dto';
import { OrderStatisticsResponse } from '../dtos/orderStatistics.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { OrderResponse, OrdersResponse } from '../dtos/orderResponse.dto';
import { CreateOrderResponse } from '../dtos/createOrderResponse.dto';
import { OrderProcessingService } from './orderProcessing.service';
import { Order } from '../entities/order.entity';
import { I18nService } from 'nestjs-i18n';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  QueuesNames,
} from '../../../common/constant/enum.constant';
import {
  DelevaryPrice,
  Limit,
  Page,
} from '../../../common/constant/messages.constant';

@Injectable()
export class OrderService {
  constructor(
    private readonly i18n: I18nService,
    private readonly dataSource: DataSource,
    private readonly orderProcessingService: OrderProcessingService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectQueue(QueuesNames.ORDER_PROCESSING) private orderQueue: Queue,
  ) {}

  async createOrderFromCart(
    userId: string,
    addressId: string,
    paymentMethod: PaymentMethod,
    delevaryPrice: number = DelevaryPrice,
    couponId?: string,
  ): Promise<CreateOrderResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.orderProcessingService.validateUser(
        queryRunner,
        userId,
        true,
      );

      await this.orderProcessingService.validateCart(user);

      this.orderQueue.add(QueuesNames.ORDER_PROCESSING, {
        userId,
        addressId,
        paymentMethod,
        delevaryPrice,
        couponId,
        cartItems: user.cart.cartItems,
      });

      await queryRunner.commitTransaction();

      return {
        data: null,
        statusCode: 201,
        message: await this.i18n.t('order.SENT'),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createOrderFromProducts(
    userId: string,
    email: string,
    addressId: string,
    paymentMethod: PaymentMethod,
    detailsId: string,
    quantity: number,
    delevaryPrice: number = DelevaryPrice,
    couponId?: string,
  ): Promise<CreateOrderResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const details = await this.orderProcessingService.validateProductDetails(
        queryRunner,
        detailsId,
      );

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

      await queryRunner.commitTransaction();

      return {
        data: null,
        statusCode: 201,
        message: await this.i18n.t('order.SENT'),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllForUser(
    userId: string,
    page: number = Page,
    limit: number = Limit,
  ): Promise<OrdersResponse> {
    const orders = await this.orderRepository.find({
      where: { userId },
      relations: [
        'orderItems',
        'orderItems.productDetails',
        'address',
        'coupon',
        'user',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (orders.length === 0) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUNDS'));
    }

    return { items: orders };
  }

  async findAll(
    page: number = Page,
    limit: number = Limit,
  ): Promise<OrdersResponse> {
    const orders = await this.orderRepository.find({
      relations: [
        'orderItems',
        'orderItems.productDetails',
        'address',
        'user',
        'coupon',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (orders.length === 0) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUNDS'));
    }

    return { items: orders };
  }

  async findById(id: string): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'orderItems',
        'orderItems.productDetails',
        'address',
        'coupon',
        'user',
      ],
    });

    if (!order) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUND'));
    }

    return { data: order };
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
  ): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUND'));
    }

    order.orderStatus = status;
    await this.orderRepository.save(order);

    return {
      data: order,
      message: await this.i18n.t('order.UPDATED_STATUS', {
        args: { id, status },
      }),
    };
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUND'));
    }

    order.paymentStatus = status;
    await this.orderRepository.save(order);

    return {
      data: order,
      message: await this.i18n.t('order.UPDATED_STATUS', {
        args: { id, status },
      }),
    };
  }

  async cancelOrder(id: string, userId: string): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({ where: { id, userId } });
    if (!order) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUND'));
    }

    order.orderStatus = OrderStatus.CANCELED;
    await this.orderRepository.save(order);

    return {
      data: order,
      message: await this.i18n.t('order.CANCELED', {
        args: { id },
      }),
    };
  }

  async deleteAnOrder(id: string): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUND'));
    }

    await this.orderRepository.remove(order);
    return {
      data: null,
      message: await this.i18n.t('order.DELETED', {
        args: { id },
      }),
    };
  }

  async deleteCompleteOrders(): Promise<OrderResponse> {
    const orders = await this.orderRepository.find({
      where: { orderStatus: OrderStatus.COMPLETED },
    });
    if (!orders.length) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUNDS'));
    }

    await this.orderRepository.remove(orders);
    return {
      data: null,
      message: await this.i18n.t('order.DELETED'),
    };
  }

  async trackOrderStatus(id: string): Promise<TrackOrderStatusResponse> {
    const order = await this.orderRepository.findOne({
      where: { id },
      select: ['orderStatus', 'updatedAt'],
    });

    if (!order)
      throw new NotFoundException(
        await this.i18n.t('order.NOT_FOUND', { args: { id } }),
      );

    return {
      data: {
        status: order.orderStatus,
        updatedAt: order.updatedAt,
      },
    };
  }

  async getOrderItems(orderId: string): Promise<OrderItemsResponse> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'orderItems.productDetails'],
    });

    if (!order)
      throw new NotFoundException(
        await this.i18n.t('order.NOT_FOUND', { args: { id: orderId } }),
      );

    return { items: order.orderItems };
  }

  async searchOrders(
    userId?: string,
    status?: OrderStatus,
    startDate?: Date,
    endDate?: Date,
    page: number = Page,
    limit: number = Limit,
  ): Promise<OrdersResponse> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('order.address', 'address')
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (userId) query.andWhere('order.userId = :userId', { userId });
    if (status) query.andWhere('order.orderStatus = :status', { status });
    if (startDate && endDate) {
      query.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const orders = await query.getMany();

    if (!orders.length) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUNDS'));
    }

    return { items: orders };
  }

  async getOrderStatistics(): Promise<OrderStatisticsResponse> {
    const [total, completed, canceled] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({
        where: { orderStatus: OrderStatus.COMPLETED },
      }),
      this.orderRepository.count({
        where: { orderStatus: OrderStatus.CANCELED },
      }),
    ]);

    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPriceAfterDiscount)', 'total')
      .where('order.orderStatus = :status', { status: OrderStatus.COMPLETED })
      .getRawOne();

    return {
      data: {
        totalOrders: total,
        completedOrders: completed,
        canceledOrders: canceled,
        totalRevenue: parseFloat(revenueResult.total) || 0,
      },
    };
  }
}
