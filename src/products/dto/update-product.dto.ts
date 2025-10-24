import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Coca Cola 500ml',
    maxLength: 40,
  })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @IsString()
  @MaxLength(40, {
    message: 'El nombre del producto no puede exceder 40 caracteres',
  })
  productName: string;

  @ApiPropertyOptional({
    description: 'Descripción del producto',
    example: 'Bebida gaseosa sabor cola',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, {
    message: 'La descripción no puede exceder 200 caracteres',
  })
  productDescription?: string;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 2500.0,
    type: Number,
  })
  @IsNotEmpty({ message: 'El precio unitario es obligatorio' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  unitPrice: number;

  @ApiProperty({
    description: 'ID de la categoría del producto',
    example: 1,
  })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsNumber({}, { message: 'El ID de categoría debe ser un número' })
  @IsPositive()
  categoryId: number;
}
