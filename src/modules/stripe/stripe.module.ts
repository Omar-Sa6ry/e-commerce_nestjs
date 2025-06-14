import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { NotificationModule } from 'src/common/queues/notification/notification.module';
import { EmailModule } from 'src/common/queues/email/email.module';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { NotificationService } from 'src/common/queues/notification/notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { OrderService } from '../order/services/order.service';
import { Order } from '../order/entities/order.entity';
import { StripeWebhookController } from './webHook';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order]),
    NotificationModule,
    EmailModule,
    OrderModule,
  ],
  controllers: [StripeWebhookController],
  providers: [
    StripeService,
    OrderService,
    SendEmailService,
    NotificationService,
  ],
  exports: [StripeService],
})
export class StripeModule {}
