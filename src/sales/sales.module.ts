import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Product } from 'src/entities/Product.entity';
import { Inventory } from 'src/entities/Inventory.entity';
import { InventoryView } from 'src/entities/Inventory-view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Inventory, InventoryView])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
