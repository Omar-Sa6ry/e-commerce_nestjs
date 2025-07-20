import { I18nService } from 'nestjs-i18n';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OrderProcessingService } from '../services/orderProcessing.service';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderProcessingJobData } from '../interface/OrderProcessingJobData.interface';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  QueuesNames,
} from 'src/common/constant/enum.constant';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { NotificationService } from 'src/common/queues/notification/notification.service';
import { BadRequestException } from '@nestjs/common';
import { Coupon } from 'src/modules/coupon/entity/coupon.entity';
import { StripeService } from 'src/modules/stripe/stripe.service';
import { Transactional } from 'src/common/decerator/transactional.decerator';
import { InjectRepository } from '@nestjs/typeorm';

@Processor(QueuesNames.ORDER_PROCESSING)
export class OrderProcessor extends WorkerHost {
  constructor(
    private readonly i18n: I18nService,
    private readonly dataSource: DataSource,
    private readonly StripeService: StripeService,
    private readonly orderProcessingService: OrderProcessingService,
    private readonly sendEmailService: SendEmailService,
    private readonly notificationService: NotificationService,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
  ) {
    super();
  }

  @Transactional()
  async process(job: Job): Promise<void> {
    const {
      userId,
      addressId,
      paymentMethod,
      delevaryPrice,
      couponId,
      cartItems,
      singleProduct,
    } = job.data as OrderProcessingJobData;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let coupon: Coupon | null = null;
      if (couponId) {
        coupon = await this.orderProcessingService.validateCoupon(couponId);
      }

      const address = await this.orderProcessingService.validateAddress(
        userId,
        addressId,
      );

      const user = await this.orderProcessingService.validateUser(
        userId,
        !!cartItems,
      );

      const order = new Order();
      order.userId = userId;
      order.address = address;
      order.paymentMethod = paymentMethod;
      order.orderStatus = OrderStatus.PENDING;
      order.paymentStatus = PaymentStatus.UNPAID;

      await this.orderRepository.save(order);

      let totalPrice = 0;

      if (cartItems) {
        totalPrice = await this.orderProcessingService.processCartItems(
          cartItems,
          order.id,
          delevaryPrice,
        );
      } else if (singleProduct) {
        totalPrice = await this.orderProcessingService.processSingleProduct(
          order.id,
          singleProduct.detailsId,
          singleProduct.quantity,
          delevaryPrice,
        );
      } else {
        throw new BadRequestException(
          await this.i18n.t('order.PRODUCT_NOT_FOUND'),
        );
      }

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

      this.sendEmailService.sendEmail(
        user.email,
        await this.i18n.t('order.CREATE'),
        await this.i18n.t('order.CREATED'),
      );

      this.notificationService.sendNotification(
        user.fcmToken,
        await this.i18n.t('order.CREATE'),
        await this.i18n.t('order.CREATED'),
      );

      let paymentData: string | null = null;

      if (paymentMethod === PaymentMethod.STRIPE) {
        if (singleProduct) {
          const items = [
            {
              name: singleProduct.productName,
              price: singleProduct.productPrice,
              quantity: singleProduct.quantity,
            },
          ];

          paymentData = await this.StripeService.handleStripePayment(
            userId,
            order.id,
            user.email,
            items,
          );
        } else if (cartItems) {
          const items = user.cart.cartItems.map((item) => ({
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          }));

          paymentData = await this.StripeService.handleStripePayment(
            userId,
            order.id,
            user.email,
            items,
          );
        }

        this.sendEmailService.sendEmail(
          user.email,
          await this.i18n.t('order.SEND_URL'),
          paymentData,
        );

        this.notificationService.sendNotification(
          user.fcmToken,
          await this.i18n.t('order.SEND_URL'),
          paymentData,
        );
      }

      if (cartItems) await this.orderProcessingService.clearUserCart(user);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
