import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationObserver } from './interfaces/INotificationObserver.interface';
import { NotificationLoggingObserver } from './observer/notification.observer';
import {
  SendBulkNotificationsCommand,
  SendNotificationCommand,
} from './command/notification.command';

@Injectable()
export class NotificationService {
  private observers: NotificationObserver[] = [];

  constructor(
    @InjectQueue('send-notification') private notificationQueue: Queue,
  ) {
    this.observers.push(new NotificationLoggingObserver());
  }

  addObserver(observer: NotificationObserver): void {
    this.observers.push(observer);
  }

  private notifySuccess(jobData: any): void {
    this.observers.forEach((observer) => observer.onNotificationSent(jobData));
  }

  private notifyError(jobData: any, error: Error): void {
    this.observers.forEach((observer) =>
      observer.onNotificationError(jobData, error),
    );
  }

  async sendNotification(
    fcmToken: string,
    title: string,
    body: string,
  ): Promise<void> {
    const command = new SendNotificationCommand(this, fcmToken, title, body);
    await command.execute();
  }

  async sendNotifications(
    notifications: { fcmToken: string; title: string; body: string }[],
  ): Promise<void> {
    const command = new SendBulkNotificationsCommand(this, notifications);
    await command.execute();
  }

  async queueNotification(
    fcmToken: string,
    title: string,
    body: string,
  ): Promise<void> {
    try {
      await this.notificationQueue.add('send-notification', {
        fcmToken,
        title,
        body,
      });
      this.notifySuccess({ fcmToken, title });
    } catch (error) {
      this.notifyError({ fcmToken, title }, error);
      throw error;
    }
  }
}
