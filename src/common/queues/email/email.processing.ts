import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { Transporter } from 'nodemailer';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(@Inject('MAILER') private readonly transporter: Transporter) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { to, subject, text } = job.data;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
      });

      console.log('Email sent: %s', info.messageId);
    } catch (error) {
      console.error('Failed to send email:', error.message);
      throw error;
    }
  }
}
