import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TrackOrderStatusResponse } from '../dtos/trackOrder.dto';
import { Product } from 'src/modules/product/entities/product.entity';
import { OrderItemsResponse } from '../dtos/orderItemResponse.dto';
import { PaymentService } from './payment.service';
import { OrderResponse, OrdersResponse } from '../dtos/orderResponse.dto';
import { CreateOrderResponse } from '../dtos/createOrderResponse.dto';
import { OrderProcessingService } from './orderProcessing.service';
import { Order } from '../entities/order.entity';
import { I18nService } from 'nestjs-i18n';
import {
  OrderStatus,
  PaymentMethod,
} from '../../../common/constant/enum.constant';
import {
  DelevaryPrice,
  Limit,
  Page,
} from '../../../common/constant/messages.constant';
import { OrderStatisticsResponse } from '../dtos/orderStatistics.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly i18n: I18nService,
    private readonly dataSource: DataSource,
    private readonly paymentService: PaymentService,
    private readonly orderProcessingService: OrderProcessingService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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
      const coupon =
        (await this.orderProcessingService.validateCoupon(
          queryRunner,
          couponId,
        )) || null;

      const address = await this.orderProcessingService.validateAddress(
        queryRunner,
        userId,
        addressId,
      );

      const user = await this.orderProcessingService.validateUser(
        queryRunner,
        userId,
        true,
      );

      await this.orderProcessingService.validateAddress(
        queryRunner,
        userId,
        addressId,
      );
      await this.orderProcessingService.validateCart(user);

      const order = await queryRunner.manager.create(Order, {
        userId,
        addressId: address.id,
        couponId: coupon?.id ?? null,
        paymentMethod,
      });
      await queryRunner.manager.save(order);

      const totalPrice = await this.orderProcessingService.processCartItems(
        queryRunner,
        user.cart.cartItems,
        order.id,
        delevaryPrice,
      );

      let totalPriceAfterDiscount = totalPrice;
      if (coupon) {
        totalPriceAfterDiscount =
          this.orderProcessingService.applyCouponDiscount(coupon, totalPrice);
      }

      let paymentData = null;
      if (paymentMethod === PaymentMethod.STRIPE) {
        const items = user.cart.cartItems.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        }));

        paymentData = await this.paymentService.handleStripePayment(
          userId,
          user.email,
          items,
        );
      }

      order.totalPrice = parseFloat(totalPrice.toFixed(2));
      order.totalPriceAfterDiscount = parseFloat(
        totalPriceAfterDiscount.toFixed(2),
      );

      await queryRunner.manager.save(order);
      await this.orderProcessingService.clearUserCart(queryRunner, user);
      await queryRunner.commitTransaction();

      return {
        data: {
          url: paymentData,
          order,
        },
        statusCode: 201,
        message: await this.i18n.t('order.CREATED'),
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
      const coupon =
        (await this.orderProcessingService.validateCoupon(
          queryRunner,
          couponId,
        )) || null;

      const details = await this.orderProcessingService.validateProductDetails(
        queryRunner,
        detailsId,
      );

      const address = await this.orderProcessingService.validateAddress(
        queryRunner,
        userId,
        addressId,
      );

      const user = await this.orderProcessingService.validateUser(
        queryRunner,
        userId,
      );

      await this.orderProcessingService.validateAddress(
        queryRunner,
        userId,
        addressId,
      );

      const order = await queryRunner.manager.create(Order, {
        userId,
        addressId: address.id,
        couponId: coupon?.id ?? null,
        paymentMethod,
      });
      await queryRunner.manager.save(order);

      const totalPrice = await this.orderProcessingService.processSingleProduct(
        queryRunner,
        order.id,
        detailsId,
        quantity,
        delevaryPrice,
      );

      let totalPriceAfterDiscount = totalPrice;
      if (coupon) {
        totalPriceAfterDiscount =
          this.orderProcessingService.applyCouponDiscount(coupon, totalPrice);
      }

      order.totalPrice = parseFloat(totalPrice.toFixed(2));
      order.totalPriceAfterDiscount = parseFloat(
        totalPriceAfterDiscount.toFixed(2),
      );
      await queryRunner.manager.save(order);

      let paymentData = null;
      if (paymentMethod === PaymentMethod.STRIPE) {
        const items = [
          {
            name: details.product.name,
            price: details.product.price,
            quantity,
          },
        ];

        paymentData = await this.paymentService.handleStripePayment(
          userId,
          user.email,
          items,
        );
      }

      await queryRunner.commitTransaction();

      return {
        data: {
          url: paymentData,
          order,
        },
        statusCode: 201,
        message: await this.i18n.t('order.CREATED'),
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
