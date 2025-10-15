import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const mailConfig: MailerOptions = {
  transport: {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  },
  defaults: {
    from: '"No Reply GeStock" <${process.env.MAIL_FROM}>',
  },
  template: {
    dir: join(__dirname, '../templates/emails'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
