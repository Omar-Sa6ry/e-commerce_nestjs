import {
  Resolver,
  Mutation,
  Args,
  Query,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { OrderService } from './services/order.service';
import { CurrentUser } from 'src/common/decerator/currentUser.decerator';
import { Auth } from 'src/common/decerator/auth.decerator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { Order } from './entities/order.entity';
import { OrdersResponse, OrderResponse } from './dtos/orderResponse.dto';
import { CreateOrderResponse } from './dtos/createOrderResponse.dto';
import { OrderItem } from './entities/orderItem.entity';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Permission,
  Role,
} from 'src/common/constant/enum.constant';
import { TrackOrderStatusResponse } from './dtos/trackOrder.dto';
import { OrderItemsResponse } from './dtos/orderItemResponse.dto';
import { OrderStatisticsResponse } from './dtos/orderStatistics.dto';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(() => CreateOrderResponse)
  @Auth([Role.USER], [Permission.CREATE_ORDER])
  createOrderFromCart(
    @CurrentUser() user: CurrentUserDto,
    @Args('addressId') addressId: string,
    @Args('paymentMethod', { type: () => PaymentMethod })
    paymentMethod: PaymentMethod,
    @Args('deliveryPrice', { type: () => Int, nullable: true })
    deliveryPrice?: number,
    @Args('couponId', { nullable: true }) couponId?: string,
  ): Promise<CreateOrderResponse> {
    return this.orderService.createOrderFromCart(
      user.id,
      addressId,
      paymentMethod,
      deliveryPrice,
      couponId,
    );
  }

  @Mutation(() => CreateOrderResponse)
  @Auth([Role.USER], [Permission.CREATE_ORDER])
  createOrderFromProducts(
    @CurrentUser() user: CurrentUserDto,
    @Args('addressId') addressId: string,
    @Args('paymentMethod', { type: () => PaymentMethod })
    paymentMethod: PaymentMethod,
    @Args('detailsId') detailsId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
    @Args('deliveryPrice', { type: () => Int, nullable: true })
    deliveryPrice?: number,
    @Args('couponId', { nullable: true }) couponId?: string,
  ): Promise<CreateOrderResponse> {
    return this.orderService.createOrderFromProducts(
      user.id,
      user.email,
      addressId,
      paymentMethod,
      detailsId,
      quantity,
      deliveryPrice,
      couponId,
    );
  }

  @Query(() => OrdersResponse)
  @Auth([Role.ADMIN], [Permission.VIEW_ALL_ORDERS])
  getAllOrders(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<OrdersResponse> {
    return this.orderService.findAll(page, limit);
  }

  @Query(() => OrdersResponse)
  @Auth([Role.USER], [])
  getMyOrders(
    @CurrentUser() user: CurrentUserDto,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<OrdersResponse> {
    return this.orderService.findAllForUser(user.id, page, limit);
  }

  @Query(() => OrderResponse)
  @Auth([Role.USER, Role.ADMIN], [])
  getOrderById(@Args('id') id: string): Promise<OrderResponse> {
    return this.orderService.findById(id);
  }

  @Mutation(() => OrderResponse)
  @Auth([Role.ADMIN], [Permission.UPDATE_ORDER])
  updateOrderStatus(
    @Args('id') id: string,
    @Args('status', { type: () => OrderStatus }) status: OrderStatus,
  ): Promise<OrderResponse> {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Mutation(() => OrderResponse)
  @Auth([Role.ADMIN], [Permission.UPDATE_ORDER])
  updatePaymentStatus(
    @Args('id') id: string,
    @Args('status', { type: () => PaymentStatus }) status: PaymentStatus,
  ): Promise<OrderResponse> {
    return this.orderService.updatePaymentStatus(id, status);
  }

  @Mutation(() => OrderResponse)
  @Auth([Role.USER], [])
  cancelOrder(
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: string,
  ): Promise<OrderResponse> {
    return this.orderService.cancelOrder(id, user.id);
  }

  @Mutation(() => OrderResponse)
  @Auth([Role.ADMIN], [Permission.DELETE_ORDER])
  deleteOrder(@Args('id') id: string): Promise<OrderResponse> {
    return this.orderService.deleteAnOrder(id);
  }

  @Mutation(() => OrderResponse)
  @Auth([Role.ADMIN], [Permission.DELETE_ORDER])
  deleteCompletedOrder(): Promise<OrderResponse> {
    return this.orderService.deleteCompleteOrders();
  }

  @Query(() => OrdersResponse)
  async searchOrders(
    @Args('userId', { nullable: true }) userId?: string,
    @Args('status', { nullable: true }) status?: OrderStatus,
    @Args('startDate', { type: () => Date, nullable: true }) startDate?: Date,
    @Args('endDate', { type: () => Date, nullable: true }) endDate?: Date,
    @Args('page', { type: () => Number, nullable: true }) page?: number,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
  ): Promise<OrdersResponse> {
    return this.orderService.searchOrders(
      userId,
      status,
      startDate,
      endDate,
      page,
      limit,
    );
  }

  @Query(() => OrderItemsResponse)
  @Auth([Role.USER], [Permission.VIEW_ORDER_ITEM])
  async getOrderItems(
    @Args('orderId') orderId: string,
  ): Promise<OrderItemsResponse> {
    return this.orderService.getOrderItems(orderId);
  }

  @Query(() => TrackOrderStatusResponse)
  @Auth([Role.ADMIN], [Permission.TRACK_ORDER_STATUS])
  async trackOrderStatus(
    @Args('id') id: string,
  ): Promise<TrackOrderStatusResponse> {
    return this.orderService.trackOrderStatus(id);
  }

  @Query(() => OrderStatisticsResponse)
  // @Auth([Role.ADMIN], [Permission.ORDER_STATICTISC])
  async orderStatistics(): Promise<OrderStatisticsResponse> {
    return this.orderService.getOrderStatistics();
  }

  @ResolveField(() => [OrderItem])
  async orderItems(@Parent() order: Order): Promise<OrderItem[]> {
    const data = await this.orderService.getOrderItems(order.id);
    return data.items;
  }
}
