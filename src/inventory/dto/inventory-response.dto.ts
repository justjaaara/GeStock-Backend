import { ApiProperty } from '@nestjs/swagger';

export class InventoryResponseDto {
  @ApiProperty({
    example: 'PROD001',
    description: 'Código del producto',
  })
  productCode: string;

  @ApiProperty({
    example: 'Coca Cola 500ml',
    description: 'Nombre del producto',
  })
  productName: string;

  @ApiProperty({
    example: 'Bebida gaseosa sabor cola',
    description: 'Descripción del producto',
  })
  productDescription: string;

  @ApiProperty({ example: 'Bebidas', description: 'Categoría del producto' })
  productCategory: string;

  @ApiProperty({ example: '50', description: 'Stock actual disponible' })
  currentStock: number;

  @ApiProperty({ example: '10', description: 'Stock mínimo configurado' })
  minimumStock: number;

  @ApiProperty({ example: 2500.0, description: 'Precio unitario del producto' })
  unitPrice: number;

  @ApiProperty({ example: 'Activo', description: 'Estado actual del producto' })
  productState: string;

  @ApiProperty({
    example: 123,
    description: 'ID del lote asociado al producto',
    nullable: true,
  })
  lotId: number;

  @ApiProperty({
    example: 'Unidad',
    description: 'Tipo de medida del producto',
  })
  measurementType: string;
}
