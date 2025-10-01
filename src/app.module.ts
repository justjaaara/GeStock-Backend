import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { roleProviders } from './providers/role-providers/role-providers';
import { UserProviders } from './providers/user-providers/user-providers';
import { DatabaseModule } from './config/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true, // hace que las variables env estén disponibles en toda la app
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ...roleProviders, ...UserProviders],
})
export class AppModule {}
