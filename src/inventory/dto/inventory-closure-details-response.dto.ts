import { ApiProperty } from '@nestjs/swagger';

export class InventoryClosureDetailsResponseDto {
  @ApiProperty({
    example: 123,
    description: 'ID del registro de cierre',
  })
  closureId: number;

  @ApiProperty({
    example: '2025-10-26T14:30:00Z',
    description: 'Fecha del cierre',
  })
  closureDate: Date;

  @ApiProperty({
    example: 50,
    description: 'Stock final del producto en el cierre',
  })
  finalStock: number;

  @ApiProperty({
    example: 456,
    description: 'ID del lote (puede ser null)',
    nullable: true,
  })
  lotId: number | null;

  @ApiProperty({
    example: 'Coca Cola 500ml',
    description: 'Nombre del producto',
  })
  productName: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del usuario que realizó el cierre',
  })
  userName: string;

  @ApiProperty({
    example: 789,
    description: 'ID del encabezado del cierre',
  })
  headerId: number;
}
