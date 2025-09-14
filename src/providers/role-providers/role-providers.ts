import { Role } from 'src/entities/Role.entity';
import { DataSource } from 'typeorm';

export const RoleProviders = [
  {
    provide: 'ROLE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Role),
    inject: ['DATA_SOURCE'],
  },
];
