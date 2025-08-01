import { NotificationStrategy } from '../interfaces/INotification.interface';

export class FirebaseNotificationStrategy implements NotificationStrategy {
  constructor(private firebaseAdmin: any) {}

  async send(fcmToken: string, title: string, body: string): Promise<void> {
    await this.firebaseAdmin.defaultApp.messaging().send({
      notification: { title, body },
      token: fcmToken,
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
    });
  }
}
