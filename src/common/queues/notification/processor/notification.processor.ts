import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationStrategy } from '../interfaces/INotification.interface';
import { FirebaseNotificationStrategy } from '../strategy/notification.strategy';

@Processor('send-notification')
@Injectable()
export class NotificationProcessor extends WorkerHost {
  private strategy: NotificationStrategy;

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    super();
    this.strategy = new FirebaseNotificationStrategy(this.firebaseAdmin);
  }

  async process(job: Job): Promise<void> {
    const { fcmToken, title, body } = job.data;

    try {
      await this.strategy.send(fcmToken, title, body);
      console.log('Notification sent:', title);
    } catch (error) {
      console.error('Notification failed:', error.message);
      throw error;
    }
  }
}
