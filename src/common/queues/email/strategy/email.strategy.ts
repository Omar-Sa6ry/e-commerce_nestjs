import { IEmailStrategy } from '../interfaces/IemailStrategy.interface';

export class SMTPEmailStrategy implements IEmailStrategy {
  constructor(private transporter: any) {}

  async send(to: string, subject: string, text: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
    });
  }
}
