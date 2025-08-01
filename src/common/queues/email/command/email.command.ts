import { IEmailCommand } from '../interfaces/IEmailCommand.interface';
import { SendEmailService } from '../sendemail.service';

export class SendEmailCommand implements IEmailCommand {
  constructor(
    private service: SendEmailService,
    private to: string,
    private subject: string,
    private text: string,
  ) {}

  async execute(): Promise<void> {
    await this.service.sendEmail(this.to, this.subject, this.text);
  }
}
