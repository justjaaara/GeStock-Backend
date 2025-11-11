import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { Role } from 'src/entities/Role.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailNotificationService } from './email-notification.service';
import { PasswordResetService } from './password-reset.service';
import { TokenManagerService } from './token-manager.service';
import { JwtStrategy } from './strategies/jwt-auth.strategie';
import { createMailConfig } from 'src/config/mail.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const raw = configService.get<string>('JWT_EXPIRES_IN', '24h');
        // jwt signOptions.expiresIn accepts number (seconds) or string like '24h'
        // If the env value is numeric, convert to number; otherwise keep as string
        const expiresIn: number | string = /^[0-9]+$/.test(String(raw))
          ? Number(raw)
          : raw;

        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn,
          },
        } as JwtModuleOptions;
      },
      inject: [ConfigService],
    }),
    // Configuración de MailerModule para el servicio de correos
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        createMailConfig(configService),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordResetService,
    TokenManagerService,
    EmailNotificationService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
