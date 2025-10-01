import { Module } from '@nestjs/common';
import { databaseProviders } from './database.provider';
import { roleProviders } from 'src/providers/role-providers/role-providers';
import { SeederService } from './seeder.service';

@Module({
  providers: [...databaseProviders, ...roleProviders, SeederService],
  exports: [...databaseProviders, ...roleProviders],
})
export class DatabaseModule {}
