import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'oracle',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT!, 10) || 1539,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        serviceName: process.env.DB_SERVICE_NAME || 'FREEPDB1',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // TODO: QUITAR EN PRODUCCIOÓN (FALSE)
        synchronize: process.env.DB_SYNCRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
      });

      return dataSource.initialize();
    },
  },
];
