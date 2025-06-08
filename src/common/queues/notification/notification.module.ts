import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { NotificationService } from './notification.service'
import { NotificationProcessor } from './notification.processor'
import { firebaseAdminProvider } from './config/firebaseAdminProvider'

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
    BullModule.registerQueue({ name: 'send-notification' }),
  ],
  providers: [
    firebaseAdminProvider,
    NotificationProcessor,
    NotificationService,
  ],
  exports: [BullModule, NotificationService],
})
export class NotificationModule {}
