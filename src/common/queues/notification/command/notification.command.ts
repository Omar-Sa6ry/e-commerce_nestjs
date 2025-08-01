import { INotificationCommand } from '../interfaces/INotificationCommand.interface';
import { NotificationService } from '../notification.service';

export class SendNotificationCommand implements INotificationCommand {
  constructor(
    private service: NotificationService,
    private fcmToken: string,
    private title: string,
    private body: string,
  ) {}

  async execute(): Promise<void> {
    await this.service.sendNotification(this.fcmToken, this.title, this.body);
  }
}

export class SendBulkNotificationsCommand implements INotificationCommand {
  constructor(
    private service: NotificationService,
    private notifications: { fcmToken: string; title: string; body: string }[],
  ) {}

  async execute(): Promise<void> {
    await this.service.sendNotifications(this.notifications);
  }
}
