import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { RfidDto } from './dto/rfid.dto';

@Controller('rfid')
export class RfidController {
  private readonly logger = new Logger(RfidController.name);

  @Post()
  @HttpCode(HttpStatus.CREATED)
  receive(@Body() payload: RfidDto, @Headers('authorization') auth?: string) {
    if (!payload || !payload.uid) {
      throw new BadRequestException('uid missing');
    }

    const expected = process.env.RFID_API_TOKEN;
    if (expected) {
      if (!auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== expected) {
        throw new UnauthorizedException();
      }
    }

    // Aquí podrías inyectar un servicio para persistir la lectura o emitir eventos
    this.logger.log(`RFID read: ${JSON.stringify(payload)}`);

    return { status: 'ok' };
  }
}
