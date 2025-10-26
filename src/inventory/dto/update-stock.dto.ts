import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
  })
  @IsNumber()
  productId: number;

  @ApiPropertyOptional({
    description: 'ID del lote (opcional)',
    example: 101,
  })
  @IsNumber()
  @IsOptional()
  lotId?: number | null;

  @ApiProperty({
    description: 'Cantidad del movimiento',
    example: 100,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Código del producto',
    example: 'PROD001',
  })
  @IsString()
  productCode: string;

  @ApiProperty({
    description: 'ID del usuario que realiza el movimiento',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: ['ENTRADA', 'SALIDA'],
    example: 'ENTRADA',
  })
  @IsString()
  @IsEnum(['ENTRADA', 'SALIDA'])
  type: 'ENTRADA' | 'SALIDA';

  @ApiProperty({
    description: 'Razón del movimiento',
    enum: [
      'COMPRA',
      'AJUSTE INVENTARIO',
      'VENTA',
      'DEVOLUCION CLIENTE',
      'DAÑO',
    ],
    example: 'COMPRA',
  })
  @IsString()
  @IsEnum(
    ['COMPRA', 'AJUSTE INVENTARIO', 'VENTA', 'DEVOLUCION CLIENTE', 'DAÑO'],
    {
      message:
        'movementReason debe ser uno de: COMPRA, AJUSTE INVENTARIO, VENTA, DEVOLUCION CLIENTE, DAÑO',
    },
  )
  movementReason:
    | 'COMPRA'
    | 'AJUSTE INVENTARIO'
    | 'VENTA'
    | 'DEVOLUCION CLIENTE'
    | 'DAÑO';
}
