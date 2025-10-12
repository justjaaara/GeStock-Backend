import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { DatabaseModule } from './config/database.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log('🔧 Configuración de Base de Datos:');
        console.log('DB_HOST:', configService.get<string>('DB_HOST'));
        console.log('DB_PORT:', configService.get<number>('DB_PORT'));
        console.log(
          'DB_SERVICE_NAME:',
          configService.get<string>('DB_SERVICE_NAME'),
        );
        console.log('DB_USERNAME:', configService.get<string>('DB_USERNAME'));
        console.log(
          'DB_SYNCHRONIZE:',
          configService.get<string>('DB_SYNCHRONIZE'),
        );
        console.log('DB_LOGGING:', configService.get<string>('DB_LOGGING'));

        return {
          type: 'oracle',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 1539),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          serviceName: configService.get<string>('DB_SERVICE_NAME', 'FREEPDB1'),
          autoLoadEntities: true,
          logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
          dropSchema: false,
          migrationsRun: false,
          extra: {
            trustServerCertificate: true,
          },
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
