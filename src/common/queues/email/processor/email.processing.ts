import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { SMTPEmailStrategy } from '../strategy/email.strategy';
import { IEmailStrategy } from '../interfaces/IemailStrategy.interface';

@Processor('email')
@Injectable()
export class EmailProcessor extends WorkerHost {
  private strategy: IEmailStrategy;

  constructor(@Inject('MAILER') private readonly transporter: any) {
    super();
    this.strategy = new SMTPEmailStrategy(this.transporter);
  }

  async process(job: Job): Promise<void> {
    const { to, subject, text } = job.data;

    try {
      await this.strategy.send(to, subject, text);
      console.log('Email sent:', job.data.subject);
    } catch (error) {
      console.error('Email failed:', error.message);
      throw error;
    }
  }
}
