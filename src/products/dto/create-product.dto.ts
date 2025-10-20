import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
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

  @ApiProperty({
    description: 'ID de la unidad de medida',
    example: 1,
  })
  @IsNotEmpty({ message: 'La unidad de medida es obligatoria' })
  @IsNumber({}, { message: 'El ID de medida debe ser un número' })
  @IsPositive()
  measurementId: number;

  @ApiProperty({
    description: 'Stock actual del producto',
    example: 100,
  })
  @IsNotEmpty({ message: 'El stock actual es obligatorio' })
  @IsNumber({}, { message: 'El stock actual debe ser un número' })
  @Min(0, { message: 'El stock actual no puede ser negativo' })
  actualStock: number;

  @ApiPropertyOptional({
    description: 'Stock mínimo para alertas',
    example: 10,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El stock mínimo debe ser un número' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  minimumStock?: number;

  @ApiPropertyOptional({
    description: 'ID del lote (batch) asociado',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del lote debe ser un número' })
  @IsPositive()
  lotId?: number;
}
