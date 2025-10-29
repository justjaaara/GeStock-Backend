import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RfidController } from './rfid.controller';
import { RfidService } from './rfid.service';
import { Product } from '../entities/Product.entity';
import { Batch } from '../entities/Batches.entity';
import { Inventory } from '../entities/Inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Batch, Inventory]),
  ],
  controllers: [RfidController],
  providers: [RfidService],
  exports: [RfidService],
})
export class RfidModule {}
