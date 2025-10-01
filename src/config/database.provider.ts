import { ConfigService } from '@nestjs/config';
import { Role } from 'src/entities/Role.entity';
import { User } from 'src/entities/User.entity';
import { DataSource } from 'typeorm';

interface OracleTable {
  TABLE_NAME: string;
}
export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (configService: ConfigService) => {
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

      const dataSource = new DataSource({
        type: 'oracle',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 1539),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        serviceName: configService.get<string>('DB_SERVICE_NAME', 'FREEPDB1'),
        entities: [User, Role],
        synchronize:
          configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
        dropSchema: false, // Importante para no borrar datos
        migrationsRun: false,
        // Configuraciones adicionales para Oracle
        extra: {
          trustServerCertificate: true,
        },
      });

      console.log('🔑 Oracle connection config:', {
        user: configService.get<string>('DB_USERNAME'),
        pass: configService.get<string>('DB_PASSWORD') ? '***' : undefined,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        service: configService.get<string>('DB_SERVICE_NAME'),
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
      });

      try {
        const initialized = await dataSource.initialize();
        console.log('✅ Database connection initialized successfully');

        // Verificar si las tablas existen
        const queryRunner = initialized.createQueryRunner();
        try {
          const tables: OracleTable[] = (await queryRunner.query(`
            SELECT table_name 
            FROM user_tables 
            WHERE table_name IN ('USERS', 'ROLES')
          `)) as OracleTable[];
          console.log('📋 Existing tables:', tables);
        } catch (error) {
          console.log('⚠️ Could not check existing tables:', error);
        } finally {
          await queryRunner.release();
        }

        return initialized;
      } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
      }
    },
    inject: [ConfigService],
  },
];
