export interface NotificationStrategy {
  send(fcmToken: string, title: string, body: string): Promise<void>;
}
