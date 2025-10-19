import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailNotificationService } from './email-notification.service';
import { PasswordResetPayload } from './interfaces/password-reset-payload.interface';
import { TokenManagerService } from './token-manager.service';
import { AuthUserValidator } from './validators/auth-user.validator';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailNotificationService,
    private readonly tokenManager: TokenManagerService,
  ) {}

  /**
   * Solicita restablecimiento de contraseña
   * @param forgotPasswordDto - DTO con el email del usuario
   * @param ipAddress - Dirección IP desde donde se hace la solicitud
   * @returns Mensaje de confirmación
   */
  async requestPasswordReset(
    forgotPasswordDto: ForgotPasswordDto,
    ipAddress: string,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    this.logger.log(
      `📧 Solicitud de reset para: ${email} desde IP: ${ipAddress}`,
    );

    try {
      const user = await this.usersService.findByEmail(email);

      // No revelar si el usuario existe o no (seguridad)
      if (!user) {
        this.logger.warn(`⚠️ Usuario no encontrado: ${email}`);
        return {
          message: 'Si el correo existe, recibirás un enlace de recuperación',
        };
      }

      // Generar token JWT con información del usuario
      const payload: PasswordResetPayload = {
        email: user.email,
        userId: user.user_id,
        type: 'password-reset',
        ip: ipAddress,
        timestamp: Date.now(),
      };

      const resetSecret = this.configService.get<string>('JWT_RESET_SECRET');
      if (!resetSecret) {
        this.logger.error('JWT_RESET_SECRET no está configurado');
        throw new Error('Configuración de seguridad faltante');
      }

      const resetToken = this.jwtService.sign(payload, {
        secret: resetSecret,
        expiresIn: '15m',
      });

      // Registrar token en el gestor
      this.tokenManager.registerToken(resetToken, ipAddress);

      // Construir URL de reset
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      if (!frontendUrl) {
        this.logger.error('FRONTEND_URL no está configurado');
        throw new Error('Configuración de URL faltante');
      }

      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      // Enviar email
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetUrl,
      );

      this.logger.log(`✅ Email de reset enviado a: ${email}`);

      return {
        message: 'Si el correo existe, recibirás un enlace de recuperación',
      };
    } catch (error) {
      this.logger.error(
        `❌ Error en requestPasswordReset para ${email}:`,
        error instanceof Error ? error.stack : error,
      );

      // No revelar detalles internos al cliente
      throw new BadRequestException(
        'Error al procesar la solicitud. Intenta nuevamente.',
      );
    }
  }

  /**
   * Restablece la contraseña del usuario
   * @param resetPasswordDto - DTO con el token y nueva contraseña
   * @param ipAddress - Dirección IP desde donde se hace la solicitud
   * @returns Mensaje de confirmación
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    ipAddress: string,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    this.logger.log(`🔄 Intento de reset desde IP: ${ipAddress}`);

    try {
      // 1. Verificar si el token ya fue usado
      if (this.tokenManager.isTokenUsed(token)) {
        this.logger.warn(`⚠️ Token ya usado`);
        throw new UnauthorizedException(
          'Este enlace ya fue utilizado. Solicita uno nuevo',
        );
      }

      // 2. Verificar y decodificar el token JWT
      const payload = this.verifyToken(token);

      // 3. Validar IP
      this.tokenManager.validateTokenIP(token, ipAddress);

      // 4. Validar edad del token
      this.tokenManager.validateTokenAge(token);

      // 5. Validar tipo de token
      if (payload.type !== 'password-reset') {
        const typeStr: string = String(payload.type as unknown as string);
        this.logger.warn(`⚠️ Tipo de token inválido: ${typeStr}`);
        throw new UnauthorizedException('Token inválido');
      }

      // 6. Buscar usuario
      const user = await this.usersService.findByEmail(payload.email);
      AuthUserValidator.validateUserExists(user);

      // 7. Validar userId del token
      AuthUserValidator.validateTokenUserId(payload.userId, user.user_id);

      // 8. Validar que el usuario esté activo
      AuthUserValidator.validateUserActive(user);

      // 9. Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 10. Actualizar contraseña
      await this.usersService.updatePassword(user.user_id, hashedPassword);

      // 11. Marcar token como usado
      this.tokenManager.markTokenAsUsed(token);

      this.logger.log(`✅ Contraseña restablecida para: ${user.email}`);

      // 12. Enviar confirmación por email
      await this.emailService
        .sendPasswordChangedEmail(user.email, user.name)
        .catch((err: unknown) => {
          const details = err instanceof Error ? err.message : String(err);
          this.logger.error(
            `⚠️ Error al enviar email de confirmación: ${details}`,
          );
          // No lanzar error, la contraseña ya fue cambiada
        });

      return { message: 'Contraseña restablecida exitosamente' };
    } catch (error) {
      // Re-lanzar errores de autenticación
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `❌ Error en resetPassword:`,
        error instanceof Error ? error.stack : error,
      );

      throw new BadRequestException(
        'Error al restablecer la contraseña. Intenta nuevamente.',
      );
    }
  }

  /**
   * Verifica y decodifica el token JWT
   * @param token - Token JWT a verificar
   * @returns Payload decodificado del token
   * @throws UnauthorizedException si el token es inválido o expirado
   */
  private verifyToken(token: string): PasswordResetPayload {
    try {
      const resetSecret = this.configService.get<string>('JWT_RESET_SECRET');

      if (!resetSecret) {
        this.logger.error('JWT_RESET_SECRET no está configurado');
        throw new UnauthorizedException('Error de configuración del servidor');
      }

      return this.jwtService.verify<PasswordResetPayload>(token, {
        secret: resetSecret,
      });
    } catch (error: unknown) {
      // Manejar errores específicos de JWT sin usar propiedades inseguras
      if (typeof error === 'object' && error !== null && 'name' in error) {
        const name = String((error as { name: unknown }).name);
        if (name === 'TokenExpiredError') {
          this.logger.warn('⚠️ Token JWT expirado');
          throw new UnauthorizedException(
            'El enlace ha expirado. Solicita uno nuevo',
          );
        }
        if (name === 'JsonWebTokenError') {
          const message =
            error instanceof Error && error.message
              ? error.message
              : 'Error de token';
          this.logger.warn(`⚠️ Error JWT: ${message}`);
          throw new UnauthorizedException('Token inválido');
        }
        if (name === 'NotBeforeError') {
          this.logger.warn('⚠️ Token no válido aún');
          throw new UnauthorizedException('Token no válido');
        }
      }

      // Error desconocido
      this.logger.error(
        '❌ Error verificando token:',
        error instanceof Error ? error.stack : String(error),
      );
      throw new UnauthorizedException('Token inválido');
    }
  }
}
