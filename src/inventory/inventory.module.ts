import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryView } from 'src/entities/Inventory-view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryView])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
