import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Product } from 'src/entities/Product.entity';
import { Inventory } from 'src/entities/Inventory.entity';
import { InventoryView } from 'src/entities/Inventory-view.entity';
import { HistoricalMovements } from 'src/entities/Historical-movements.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Inventory,
      InventoryView,
      HistoricalMovements,
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
