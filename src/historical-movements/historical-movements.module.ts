import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoricalMovements } from 'src/entities/Historical-movements.entity';
import { HistoricalMovementsService } from './historical-movements.service';
import { HistoricalMovementsController } from './historical-movements.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistoricalMovements])],
  controllers: [HistoricalMovementsController],
  providers: [HistoricalMovementsService],
})
export class HistoricalMovementsModule {}
