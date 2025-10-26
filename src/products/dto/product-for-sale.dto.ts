import { ApiProperty } from '@nestjs/swagger';

export class ProductForSaleDto {
  @ApiProperty({
    description: 'Código del producto',
    example: 'CAT-001',
  })
  productCode: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Coca Cola 500ml',
  })
  productName: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Bebida refrescante',
  })
  productDescription: string;

  @ApiProperty({
    description: 'Categoría del producto',
    example: 'Bebidas',
  })
  productCategory: string;

  @ApiProperty({
    description: 'Stock actual disponible',
    example: 150,
  })
  currentStock: number;

  @ApiProperty({
    description: 'Stock mínimo requerido',
    example: 50,
  })
  minimunStock: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 2500,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Estado del producto',
    example: 'Activo',
  })
  productState: string;
}
