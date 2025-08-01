import { SendEmailService } from 'src/common/queues/email/sendemail.service';

export class SendResetPasswordEmailCommand implements IEmailCommand {
  constructor(
    private readonly emailService: SendEmailService,
    private readonly email: string,
    private readonly link: string,
  ) {}

  async execute(): Promise<void> {
    await this.emailService.sendEmail(
      this.email,
      'Forgot Password',
      `Click here to reset your password: ${this.link}`,
    );
  }
}

export class SendWelcomeEmailCommand implements IEmailCommand {
  constructor(
    private readonly emailService: SendEmailService,
    private readonly email: string,
  ) {}

  async execute(): Promise<void> {
    await this.emailService.sendEmail(
      this.email,
      'Register in App',
      'You registered successfully in the App',
    );
  }
}
