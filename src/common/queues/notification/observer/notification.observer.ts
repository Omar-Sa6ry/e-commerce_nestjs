import { NotificationObserver } from '../interfaces/INotificationObserver.interface';

export class NotificationLoggingObserver implements NotificationObserver {
  onNotificationSent(jobData: any): void {
    console.log(`Notification sent to ${jobData.fcmToken}`);
  }

  onNotificationError(jobData: any, error: Error): void {
    console.error(
      `Notification failed for ${jobData.fcmToken}:`,
      error.message,
    );
  }
}
