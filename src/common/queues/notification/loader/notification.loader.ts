import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../notification.service';
import { User } from 'src/modules/users/entity/user.entity';

@Injectable()
export class NotificationLoader {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  async sendNotifications(userIds: string[], title: string, body: string) {
    if (!userIds.length) return;

    const users = await this.userRepo.findByIds(userIds);

    const notifications = users.map((user) => ({
      fcmToken: user.fcmToken,
      title,
      body,
    }));

    this.notificationService.sendNotifications(notifications);
  }
}
