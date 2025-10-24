import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 1, description: 'ID de la categoría' })
  categoryId: number;

  @ApiProperty({ example: 'Bebidas', description: 'Nombre de la categoría' })
  categoryName: string;
}
