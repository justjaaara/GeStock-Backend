import { ApiProperty } from '@nestjs/swagger';

export class InventoryReportDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
  })
  productId: number;

  @ApiProperty({
    description: 'Código único del producto',
    example: 'BEBIDAS-001',
  })
  productCode: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Coca Cola 500ml',
  })
  productName: string;

  @ApiProperty({
    description: 'Descripción detallada del producto',
    example: 'Bebida gaseosa sabor cola',
  })
  productDescription: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Bebidas',
  })
  categoryName: string;

  @ApiProperty({
    description: 'Estado del producto',
    example: 'Activo',
  })
  productState: string;

  @ApiProperty({
    description: 'Tipo de medida',
    example: 'Unidad',
  })
  measurementName: string;

  @ApiProperty({
    description: 'Unidades disponibles en inventario',
    example: 150,
  })
  availableUnits: number;

  @ApiProperty({
    description: 'Stock mínimo requerido',
    example: 50,
  })
  minimumStock: number;

  @ApiProperty({
    description: 'Precio unitario',
    example: 2500,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Valor total del inventario de este producto',
    example: 375000,
  })
  totalValue: number;

  @ApiProperty({
    description: 'Código del lote',
    example: 'LOTE-2025-001',
    required: false,
  })
  lotCode: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-10-26T10:30:00Z',
  })
  lastUpdate: Date;
}

export class InventoryReportSummaryDto {
  @ApiProperty({
    description: 'Total de productos activos',
    example: 245,
  })
  totalProducts: number;

  @ApiProperty({
    description: 'Total de unidades en inventario',
    example: 15234,
  })
  totalUnits: number;

  @ApiProperty({
    description: 'Valor total del inventario',
    example: 45678900,
  })
  totalInventoryValue: number;

  @ApiProperty({
    description: 'Productos con stock bajo',
    example: 12,
  })
  lowStockProducts: number;

  @ApiProperty({
    description: 'Lista de productos del reporte',
    type: [InventoryReportDto],
  })
  products: InventoryReportDto[];
}
