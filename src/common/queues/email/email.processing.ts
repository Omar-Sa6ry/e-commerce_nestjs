import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import * as nodemailer from 'nodemailer'

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private transporter

  constructor () {
    super()
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT, 10) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })
  }

  async process (job: Job): Promise<void> {
    const { to, subject, text } = job.data

    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
      })

      console.log('Email sent: %s', info.messageId)
    } catch (error) {
      console.error('Failed to send email:', error.message)
      throw error
    }
  }
}
