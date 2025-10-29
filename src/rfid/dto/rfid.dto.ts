import { IsOptional, IsString, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class RfidDto {
  // RFID Code (UID)
  @IsString()
  p_rfid_code: string;

  // Lote
  @IsString()
  p_batch_desc: string;

  // Producto (búsqueda/creación)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  p_product_id?: number;

  @IsOptional()
  @IsString()
  p_product_code?: string;

  @IsString()
  p_product_name: string;

  @IsNumber()
  @Type(() => Number)
  p_unit_price: number;

  @IsOptional()
  @IsString()
  p_product_desc?: string;

  // Campos REQUERIDOS para que aparezca en la vista
  @IsNumber()
  @Type(() => Number)
  p_category_id: number;

  @IsNumber()
  @Type(() => Number)
  p_measurement_id: number;

  @IsNumber()
  @Type(() => Number)
  p_state_id: number;

  // Inventario / Movimiento
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  p_quantity: number;

  @IsString()
  p_reference: string;

  @IsNumber()
  @Type(() => Number)
  p_user_id: number;

  @IsString()
  p_movement_reason: string;

  // Metadata opcional (no se pasa al SP)
  @IsOptional()
  @IsString()
  ts?: string;

  @IsOptional()
  @IsString()
  device?: string;
}
