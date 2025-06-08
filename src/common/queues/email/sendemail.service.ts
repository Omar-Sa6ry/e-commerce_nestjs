import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class SendEmailService {
  constructor (@InjectQueue('email') private readonly emailQueue: Queue) {}

  async sendEmail (to: string, subject: string, text: string) {
    await this.emailQueue.add('send-email', { to, subject, text })
    console.log(`Job added to queue to send email to ${to}`)
  }
}
