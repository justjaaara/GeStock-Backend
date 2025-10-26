import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterHistoricalMovementsDto {
  @ApiPropertyOptional({
    description: 'Nombre del producto',
    example: 'Coca Cola 500ml',
  })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({
    description: 'Tipo de movimiento',
    enum: ['ENTRADA', 'SALIDA'],
    example: 'ENTRADA',
  })
  @IsOptional()
  @IsEnum(['ENTRADA', 'SALIDA'])
  movementType?: 'ENTRADA' | 'SALIDA';

  @ApiPropertyOptional({
    description: 'Fecha inicial del rango (ISO 8601)',
    format: 'date',
    example: '2025-10-20',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha final del rango (ISO 8601)',
    format: 'date',
    example: '2025-10-25',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
