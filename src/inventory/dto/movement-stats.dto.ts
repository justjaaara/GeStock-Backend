import { ApiProperty } from '@nestjs/swagger';

export class MovementStatsDto {
  @ApiProperty({
    example: 'Coca Cola 500ml',
    description: 'Nombre del producto con más movimientos',
  })
  mostMovedProduct: string;

  @ApiProperty({
    example: 45,
    description: 'Número de movimientos del producto con más movimientos',
  })
  mostMovedCount: number;

  @ApiProperty({
    example: 'Agua Mineral 500ml',
    description: 'Nombre del producto con menos movimientos',
  })
  leastMovedProduct: string;

  @ApiProperty({
    example: 2,
    description: 'Número de movimientos del producto con menos movimientos',
  })
  leastMovedCount: number;

  @ApiProperty({
    example: '2025-10-01',
    description: 'Fecha de inicio del período analizado',
  })
  startDate: string;

  @ApiProperty({
    example: '2025-10-31',
    description: 'Fecha de fin del período analizado',
  })
  endDate: string;
}
