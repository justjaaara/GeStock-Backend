import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(private readonly mailerService: MailerService) {}

  private formatError(error: unknown): string {
    if (error instanceof Error) return error.stack ?? error.message;
    if (typeof error === 'string') return error;
    try {
      return JSON.stringify(error, Object.getOwnPropertyNames(error));
    } catch {
      return String(error);
    }
  }

  /**
   * Envía email de recuperación de contraseña
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    try {
      this.logger.log(`📨 Enviando correo de recuperación a ${email}`);

      await this.mailerService.sendMail({
        to: email,
        subject: 'Restablecimiento de contraseña - GeStock',
        template: './reset-password',
        context: {
          name,
          resetUrl,
          expirationTime: '15 minutos',
        },
      });

      this.logger.log(`✅ Correo enviado exitosamente a ${email}`);
    } catch (error) {
      const safeDetails = (() => {
        if (error instanceof Error) return error.stack ?? error.message;
        if (typeof error === 'string') return error;
        try {
          return JSON.stringify(error, Object.getOwnPropertyNames(error));
        } catch {
          return String(error);
        }
      })();

      this.logger.error(`❌ Error al enviar correo a ${email}`, safeDetails);
      throw error;
    }
  }

  /**
   * Envía email de confirmación de cambio de contraseña
   */
  async sendPasswordChangedEmail(email: string, name: string): Promise<void> {
    try {
      this.logger.log(
        `📨 Enviando confirmación de cambio de contraseña a ${email}`,
      );

      await this.mailerService.sendMail({
        to: email,
        subject: 'Confirmación de cambio de contraseña - GeStock',
        template: './password-changed',
        context: { name },
      });

      this.logger.log(`✅ Confirmación enviada a ${email}`);
    } catch (error) {
      const details = this.formatError(error);
      this.logger.error(`⚠️ Error al enviar confirmación a ${email}`, details);
      // No lanzar error, la contraseña ya fue cambiada
    }
  }

  /**
   * Envía email de bienvenida
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      this.logger.log(`📨 Enviando email de bienvenida a ${email}`);

      await this.mailerService.sendMail({
        to: email,
        subject: 'Bienvenido a GeStock',
        template: './welcome',
        context: { name },
      });

      this.logger.log(`✅ Email de bienvenida enviado a ${email}`);
    } catch (error) {
      const details = this.formatError(error);
      this.logger.error(
        `⚠️ Error al enviar email de bienvenida a ${email}`,
        details,
      );
    }
  }
}
