import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: 'ID del producto' })
  productId: number;

  @ApiProperty({
    example: 'Coca Cola 500ml',
    description: 'Nombre del producto',
  })
  productName: string;

  @ApiPropertyOptional({
    example: 'Bebida gaseosa sabor cola',
    description: 'Descripción del producto',
  })
  productDescription?: string;

  @ApiPropertyOptional({
    example: 'PROD001',
    description: 'Código del producto',
  })
  productCode?: string;

  @ApiProperty({ example: 2500.0, description: 'Precio unitario' })
  unitPrice: number;

  @ApiPropertyOptional({
    example: 'Bebidas',
    description: 'Categoría del producto',
  })
  categoryName?: string;

  @ApiPropertyOptional({ example: 'Unidad', description: 'Tipo de medida' })
  measurementName?: string;

  @ApiPropertyOptional({
    example: 'Activo',
    description: 'Estado del producto',
  })
  stateName?: string;

  @ApiProperty({ example: 100, description: 'Stock actual' })
  actualStock: number;

  @ApiPropertyOptional({ example: 10, description: 'Stock mínimo' })
  minimumStock?: number;

  @ApiProperty({
    example: '2025-10-12T10:00:00Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;
}
