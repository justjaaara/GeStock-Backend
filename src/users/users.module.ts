import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/User.entity';
import { UserState } from '../entities/User-state.entity';
import { UserManagementView } from '../entities/User-management-view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserState, UserManagementView])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
