import { I18nService } from 'nestjs-i18n';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OrderProcessingService } from '../services/orderProcessing.service';
import { DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderProcessingJobData } from '../interface/OrderProcessingJobData.interface';
import { QueuesNames } from 'src/common/constant/enum.constant';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { NotificationService } from 'src/common/queues/notification/notification.service';
import { BadRequestException } from '@nestjs/common';

@Processor(QueuesNames.ORDER_PROCESSING)
export class OrderProcessor extends WorkerHost {
  constructor(
    private readonly i18n: I18nService,
    private readonly dataSource: DataSource,
    private readonly orderProcessingService: OrderProcessingService,
    private readonly sendEmailService: SendEmailService,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

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
      const coupon = await this.orderProcessingService.validateCoupon(
        queryRunner,
        couponId,
      );

      const address = await this.orderProcessingService.validateAddress(
        queryRunner,
        userId,
        addressId,
      );

      const user = await this.orderProcessingService.validateUser(
        queryRunner,
        userId,
        !!cartItems,
      );

      const order = await queryRunner.manager.create(Order, {
        userId,
        addressId: address.id,
        couponId: coupon?.id ?? null,
        paymentMethod,
      });
      await queryRunner.manager.save(order);

      let totalPrice = 0;

      if (cartItems) {
        totalPrice = await this.orderProcessingService.processCartItems(
          queryRunner,
          cartItems,
          order.id,
          delevaryPrice,
        );

        await this.orderProcessingService.clearUserCart(queryRunner, user);
      } else if (singleProduct) {
        totalPrice = await this.orderProcessingService.processSingleProduct(
          queryRunner,
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

      if (cartItems)
        await this.orderProcessingService.clearUserCart(queryRunner, user);

      await queryRunner.commitTransaction();
      this.sendEmailService.sendEmail(
        user.email,
        await this.i18n.t('order.CREATE'),
        await this.i18n.t('order.CREATED'),
      );

      await this.notificationService.sendNotification(
        user.fcmToken,
        await this.i18n.t('order.CREATE'),
        await this.i18n.t('order.CREATED'),
      );

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
