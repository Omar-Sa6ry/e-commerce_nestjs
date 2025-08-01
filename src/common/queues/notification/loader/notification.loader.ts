import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../notification.service';
import { User } from 'src/modules/users/entity/user.entity';

@Injectable()
export class NotificationLoaderService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  async sendToUsers(
    userIds: string[],
    title: string,
    body: string,
  ): Promise<void> {
    if (!userIds.length) return;

    const users = await this.userRepo.findByIds(userIds);
    const notifications = users
      .filter((user) => user.fcmToken)
      .map((user) => ({
        fcmToken: user.fcmToken,
        title,
        body,
      }));

    if (notifications.length) {
      await this.notificationService.sendNotifications(notifications);
    }
  }
}
