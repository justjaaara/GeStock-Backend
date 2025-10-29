import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Get,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { RfidDto } from './dto/rfid.dto';
import { RfidService } from './rfid.service';

@Controller('rfid')
export class RfidController {
  private readonly logger = new Logger(RfidController.name);

  constructor(private readonly rfidService: RfidService) {}

  /**
   * Endpoint principal para recibir datos del ESP32
   * POST /api/rfid
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async receive(
    @Body() payload: RfidDto,
    @Headers('authorization') auth?: string,
  ) {
    // Validación de campos críticos
    if (!payload || !payload.p_rfid_code) {
      throw new BadRequestException({
        success: false,
        message: 'p_rfid_code es requerido',
      });
    }

    if (!payload.p_quantity || payload.p_quantity <= 0) {
      throw new BadRequestException({
        success: false,
        message: 'p_quantity debe ser mayor a 0',
      });
    }

    // Validar campos REQUERIDOS para que el producto aparezca en la vista
    if (!payload.p_category_id) {
      throw new BadRequestException({
        success: false,
        message: 'p_category_id es requerido (ej: 1 para categoría por defecto)',
      });
    }

    if (!payload.p_state_id) {
      throw new BadRequestException({
        success: false,
        message: 'p_state_id es requerido (ej: 1 para Activo)',
      });
    }

    if (!payload.p_measurement_id) {
      throw new BadRequestException({
        success: false,
        message: 'p_measurement_id es requerido (ej: 2 para Unidad)',
      });
    }

    // Validación de token (opcional, configurado en .env)
    const expectedToken = process.env.RFID_API_TOKEN;
    if (expectedToken) {
      if (!auth || !auth.startsWith('Bearer ')) {
        throw new UnauthorizedException({
          success: false,
          message: 'Token de autorización requerido',
        });
      }

      const token = auth.split(' ')[1];
      if (token !== expectedToken) {
        throw new UnauthorizedException({
          success: false,
          message: 'Token de autorización inválido',
        });
      }
    }

    // Log de recepción
    this.logger.log(`📡 RFID recibido del ESP32: ${payload.p_rfid_code}`);
    this.logger.debug(`Producto: ${payload.p_product_name} | Cantidad: ${payload.p_quantity}`);

    // Procesar la carga mediante el procedimiento almacenado
    return await this.rfidService.processRfidLoad(payload);
  }

  /**
   * Health check del servicio RFID
   * GET /api/rfid/health
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    const dbOk = await this.rfidService.healthCheck();
    
    return {
      status: dbOk ? 'ok' : 'error',
      service: 'rfid',
      database: dbOk ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
