import { Module } from '@nestjs/common';
import { RfidController } from './rfid.controller';

@Module({
  controllers: [RfidController],
  providers: [],
})
export class RfidModule {}
