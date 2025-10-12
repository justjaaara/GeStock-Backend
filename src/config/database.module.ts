import { Module } from '@nestjs/common';
import { roleProviders } from 'src/providers/role-providers/role-providers';
import { SeederService } from './seeder.service';

@Module({
  providers: [...roleProviders, SeederService],
  exports: [...roleProviders],
})
export class DatabaseModule {}
