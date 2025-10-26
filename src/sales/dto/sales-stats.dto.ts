import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TopSellingProductDto {
  @ApiProperty({
    description: 'Código del producto',
    example: 'PROD-001',
  })
  productCode: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell XPS 15',
  })
  productName: string;

  @ApiProperty({
    description: 'Cantidad total vendida',
    example: 234,
  })
  totalQuantity: number;
}

export class SalesStatsDto {
  @ApiProperty({
    description: 'Total de ventas registradas (todas las ventas históricas)',
    example: 150,
  })
  totalSales: number;

  @ApiProperty({
    description:
      'Suma total de unidades vendidas (todas las ventas históricas)',
    example: 3420,
  })
  totalQuantitySold: number;

  @ApiProperty({
    description: 'Total de ventas realizadas el día de hoy',
    example: 8,
  })
  salesToday: number;

  @ApiProperty({
    description: 'Suma de unidades vendidas el día de hoy',
    example: 45,
  })
  quantitySoldToday: number;

  @ApiPropertyOptional({
    description:
      'Producto con mayor cantidad total vendida. Null si no hay ventas',
    type: TopSellingProductDto,
    nullable: true,
  })
  topSellingProduct: TopSellingProductDto | null;
}
