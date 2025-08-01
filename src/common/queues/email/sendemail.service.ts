import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IEmailObserver } from './interfaces/iEmailObserver.interface';
import { EmailLoggingObserver } from './observer/email.observer';
import { SendEmailCommand } from './command/email.command';

@Injectable()
export class SendEmailService {
  private observers: IEmailObserver[] = [];

  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {
    this.observers.push(new EmailLoggingObserver());
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const command = new SendEmailCommand(this, to, subject, text);
    await command.execute();
  }

  async queueEmail(to: string, subject: string, text: string): Promise<void> {
    try {
      await this.emailQueue.add('send-email', { to, subject, text });
      this.notifySuccess({ to, subject });
    } catch (error) {
      this.notifyError({ to, subject }, error);
      throw error;
    }
  }

  addObserver(observer: IEmailObserver): void {
    this.observers.push(observer);
  }

  private notifySuccess(jobData: any): void {
    this.observers.forEach((observer) => observer.onEmailSent(jobData));
  }

  private notifyError(jobData: any, error: Error): void {
    this.observers.forEach((observer) => observer.onEmailError(jobData, error));
  }
}
