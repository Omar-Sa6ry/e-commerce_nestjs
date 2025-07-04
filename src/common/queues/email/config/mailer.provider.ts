import * as nodemailer from 'nodemailer';

export const mailerProvider = {
  provide: 'MAILER',
  useFactory: () => {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT, 10),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  },
};
