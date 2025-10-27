import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryView } from 'src/entities/Inventory-view.entity';
import { InventoryReportView } from 'src/entities/Inventory-report-view.entity';
import { SalesByCategoryView } from 'src/entities/Sales-by-category-view.entity';
import { IncomeByLotView } from 'src/entities/Income-by-lot-view.entity';
import { ClosureHeaderView } from 'src/entities/Closure-header-view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryView,
      InventoryReportView,
      SalesByCategoryView,
      IncomeByLotView,
      ClosureHeaderView,
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
