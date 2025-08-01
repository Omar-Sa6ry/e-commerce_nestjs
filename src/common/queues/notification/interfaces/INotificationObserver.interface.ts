export interface NotificationObserver {
  onNotificationSent(jobData: any): void;
  onNotificationError(jobData: any, error: Error): void;
}
