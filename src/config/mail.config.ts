import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const createMailConfig = (
  configService: ConfigService,
): MailerOptions => {
  console.log('📧 Configuración de correo desde mail.config.ts:');
  console.log('MAIL_HOST:', configService.get<string>('MAIL_HOST'));
  console.log('MAIL_PORT:', configService.get<number>('MAIL_PORT'));
  console.log('MAIL_USER:', configService.get<string>('MAIL_USER'));
  console.log('MAIL_FROM:', configService.get<string>('MAIL_FROM'));

  return {
    transport: {
      host: configService.get<string>('MAIL_HOST'),
      port: configService.get<number>('MAIL_PORT'),
      secure: true,
      auth: {
        user: configService.get<string>('MAIL_USER'),
        pass: configService.get<string>('MAIL_PASSWORD'),
      },
    },
    defaults: {
      from: configService.get<string>('MAIL_FROM'),
    },
    template: {
      dir: join(process.cwd(), 'src/templates/emails'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
};
