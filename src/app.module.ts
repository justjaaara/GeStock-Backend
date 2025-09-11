import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RoleProviders } from './providers/role-providers/role-providers';
import { UserProviders } from './providers/user-providers/user-providers';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService, RoleProviders, UserProviders],
})
export class AppModule {}
