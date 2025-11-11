import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RfidDto } from './dto/rfid.dto';

@Injectable()
export class RfidService {
  private readonly logger = new Logger(RfidService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Ejecuta el procedimiento almacenado CARGA_RFID_MASIVA
   * que gestiona la creación de lote, producto (si no existe), 
   * actualización de inventario y registro de movimiento.
   */
  async processRfidLoad(payload: RfidDto): Promise<any> {
    console.log('Payload recibido en el servicio RFID:', payload);
    this.logger.log(`Procesando carga RFID: ${payload.p_rfid_code}`);
    this.logger.debug(`Payload completo: ${JSON.stringify(payload)}`);

    try {
      // Preparar los parámetros para el procedimiento almacenado
      const params = [
        payload.p_rfid_code,
        payload.p_batch_desc,
        payload.p_product_id ?? null,
        payload.p_product_code ?? null,
        payload.p_product_name,
        payload.p_unit_price,
        payload.p_product_desc ?? null,
        payload.p_category_id,      // Ahora es requerido
        payload.p_measurement_id,   // Ahora es requerido
        payload.p_state_id,          // Ahora es requerido
        payload.p_quantity,
        payload.p_reference,
        payload.p_user_id,
        payload.p_movement_reason,
      ];

      // Construir la consulta para ejecutar el procedimiento almacenado
      const sql = `
        BEGIN
          CARGA_RFID_MASIVA(
            :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14
          );
        END;
      `;

      // Ejecutar el procedimiento almacenado
      await this.dataSource.query(sql, params);

      this.logger.log(`✅ Carga RFID exitosa: ${payload.p_rfid_code} - Producto: ${payload.p_product_name} - Cantidad: ${payload.p_quantity}`);

      return {
        success: true,
        message: 'Carga RFID procesada correctamente',
        data: {
          rfid_code: payload.p_rfid_code,
          product_name: payload.p_product_name,
          product_code: payload.p_product_code,
          quantity: payload.p_quantity,
          batch_desc: payload.p_batch_desc,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error procesando carga RFID: ${error.message}`, error.stack);
      
      // Parsear errores específicos de Oracle
      let errorMessage = 'Error procesando carga RFID';
      if (error.message?.includes('ORA-20001')) {
        errorMessage = 'La cantidad debe ser mayor a 0';
      } else if (error.message?.includes('ORA-')) {
        // Extraer mensaje de error de Oracle
        const match = error.message.match(/ORA-\d+:\s*(.+)/);
        if (match) {
          errorMessage = match[1];
        }
      }

      throw new InternalServerErrorException({
        success: false,
        message: errorMessage,
        details: error.message,
        rfid_code: payload.p_rfid_code,
      });
    }
  }

  /**
   * Verifica la conexión con la base de datos
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1 FROM DUAL');
      return true;
    } catch (error) {
      this.logger.error('Error en health check de base de datos', error);
      return false;
    }
  }
}
