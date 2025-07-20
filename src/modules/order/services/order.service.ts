import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackOrderStatusResponse } from '../dtos/trackOrder.dto';
import { OrderProxy } from '../proxy/order.proxy';
import { RedisService } from 'src/common/redis/redis.service';
import { Transactional } from 'src/common/decerator/transactional.decerator';
import { OrderItemsResponse } from '../dtos/orderItemResponse.dto';
import { OrderStatisticsResponse } from '../dtos/orderStatistics.dto';
import { OrderResponse, OrdersResponse } from '../dtos/orderResponse.dto';
import { Order } from '../entities/order.entity';
import { I18nService } from 'nestjs-i18n';
import { Limit, Page } from '../../../common/constant/messages.constant';
import {
  OrderStatus,
  PaymentStatus,
} from '../../../common/constant/enum.constant';

@Injectable()
export class OrderService {
  private proxy: OrderProxy;

  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,

    @InjectRepository(Order) private orderRepository: Repository<Order>,
  ) {
    this.proxy = new OrderProxy(
      this.i18n,
      this.redisService,
      this.orderRepository,
    );
  }

  async findAllForUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<OrdersResponse> {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      relations: ['orderItems', 'address', 'coupon'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (orders.length === 0) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUNDS'));
    }

    return {
      items: orders,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<OrderResponse> {
    return this.proxy.findById(id);
  }

  @Transactional()
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
      message: await this.i18n.t('order.UPDATED_STATUS', { args: { status } }),
    };
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

  @Transactional()
  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<OrderResponse> {
    const order = (await this.findById(id)!).data;
    if (!order) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUND'));
    }

    order.paymentStatus = status;
    await this.orderRepository.save(order);

    const cacheKey = `order:${id}`;
    this.redisService.set(cacheKey, Order);

    return {
      data: order,
      message: await this.i18n.t('order.UPDATED_STATUS', {
        args: { id, status },
      }),
    };
  }

  @Transactional()
  async cancelOrder(id: string, userId: string): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({ where: { id, userId } });
    if (!order) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUND'));
    }

    order.orderStatus = OrderStatus.CANCELED;
    await this.orderRepository.save(order);

    const cacheKey = `order:${id}`;
    this.redisService.set(cacheKey, Order);
    return {
      data: order,
      message: await this.i18n.t('order.CANCELED', {
        args: { id },
      }),
    };
  }

  @Transactional()
  async deleteAnOrder(id: string): Promise<OrderResponse> {
    const order = await this.findById(id);
    if (!order) {
      throw new NotFoundException(await this.i18n.t('order.NOT_FOUND'));
    }

    await this.orderRepository.remove(order.data);

    const cacheKey = `order:${id}`;
    this.redisService.del(cacheKey);
    return {
      data: null,
      message: await this.i18n.t('order.DELETED', {
        args: { id },
      }),
    };
  }

  @Transactional()
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
