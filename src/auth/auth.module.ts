import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/config/database.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt-auth.strategie';
import { UserProviders } from 'src/providers/user-providers/user-providers';
import { roleProviders } from 'src/providers/role-providers/role-providers';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'LLAVE-SECRETA',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...UserProviders, ...roleProviders],
  exports: [AuthService],
})
export class AuthModule {}
