import { Body, Controller, Headers, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { OrderService } from '../order/services/order.service';
import { PaymentStatus } from 'src/common/constant/enum.constant';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { NotificationService } from 'src/common/queues/notification/notification.service';
import { User } from '../users/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';

@Controller('webhook')
export class StripeWebhookController {
  constructor(
    private readonly i18n: I18nService,
    private readonly stripeService: StripeService,
    private readonly orderService: OrderService,
    private readonly sendEmailService: SendEmailService,
    private readonly notificationService: NotificationService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Body() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = await this.stripeService.constructEventFromPayload(
      signature,
      rawBody,
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        const userId = paymentIntent.metadata.userId;

        if (orderId && userId) {
          const user = await this.userRepository.findOne({
            where: { id: userId },
          });
          await this.orderService.updatePaymentStatus(
            orderId,
            PaymentStatus.PAID,
          );

          this.sendEmailService.sendEmail(
            user.email,
            await this.i18n.t('order.SEND_URL'),
            await this.i18n.t('order.COMPLETED_ORDER_PAY', {
              args: { orderId },
            }),
          );

          this.notificationService.sendNotification(
            user.fcmToken,
            await this.i18n.t('order.SEND_URL'),
            await this.i18n.t('order.COMPLETED_ORDER_PAY', {
              args: { orderId },
            }),
          );
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedOrderId = failedPayment.metadata.orderId;

        if (failedOrderId) {
          await this.orderService.updatePaymentStatus(
            failedOrderId,
            PaymentStatus.FAILD,
          );
        }
        break;
    }

    return { received: true };
  }
}
