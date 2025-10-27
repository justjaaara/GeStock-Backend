import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/Role.entity';
import { UserState } from '../entities/User-state.entity';
import { User } from '../entities/User.entity';
import { MeasurementType } from '../entities/Measurement-type.entity';
import { ProductCategory } from '../entities/Product-category.entity';
import { ProductState } from '../entities/Product-state.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      UserState,
      User,
      MeasurementType,
      ProductCategory,
      ProductState,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}
