import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'oracle',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 1539),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        serviceName: configService.get<string>('DB_SERVICE_NAME', 'FREEPDB1'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize:
          configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get<boolean>('DB_LOGGING', false),
      });
      //TODO: QUITAR ESTE CONSOLELOG
      console.log('🔑 Oracle creds:', {
        user: configService.get<string>('DB_USERNAME'),
        pass: configService.get<string>('DB_PASSWORD') ? '***' : undefined,
        host: configService.get<string>('DB_HOST'),
        service: configService.get<string>('DB_SERVICE_NAME'),
      });
      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
