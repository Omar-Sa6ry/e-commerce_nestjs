import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { EmailProcessor } from './email.processing'
import { SendEmailService } from './sendemail.service'

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
    BullModule.registerQueue({ name: 'email' }),
  ],
  providers: [EmailProcessor, SendEmailService],
  exports: [BullModule],
})
export class EmailModule {}
