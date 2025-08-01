import { IEmailObserver } from '../interfaces/iEmailObserver.interface';

export class EmailLoggingObserver implements IEmailObserver {
  onEmailSent(jobData: any): void {
    console.log(`Email sent to ${jobData.to}`);
  }

  onEmailError(jobData: any, error: Error): void {
    console.error(`Email failed for ${jobData.to}:`, error.message);
  }
}
