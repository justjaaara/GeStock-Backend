import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../entities/Product.entity';
import { Inventory } from '../entities/Inventory.entity';
import { ProductCategory } from 'src/entities/Product-category.entity';
import { ProductState } from 'src/entities/Product-state.entity';
import { MeasurementType } from 'src/entities/Measurement-type.entity';
import { Batch } from 'src/entities/Batches.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      ProductState,
      MeasurementType,
      Inventory,
      Batch,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
