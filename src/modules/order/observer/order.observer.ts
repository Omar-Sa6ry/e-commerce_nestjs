import { NotificationService } from 'src/common/queues/notification/notification.service';
import { Order } from '../entities/order.entity';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { IOrderObserver } from '../interfaces/IOrderObserver.interface';

export class EmailNotificationObserver implements IOrderObserver {
  constructor(private sendEmailService: SendEmailService) {}

  async notify(order: Order, message: string): Promise<void> {
    this.sendEmailService.sendEmail(order.user.email, 'Order Update', message);
  }
}

export class PushNotificationObserver implements IOrderObserver {
  constructor(private notificationService: NotificationService) {}

  async notify(order: Order, message: string): Promise<void> {
    if (order.user.fcmToken) {
      this.notificationService.sendNotification(
        order.user.fcmToken,
        'Order Update',
        message,
      );
    }
  }
}
