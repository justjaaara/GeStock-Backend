import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateSaleDto {
  @ApiProperty({
    description: 'Código del producto a vender',
    example: 'PROD001',
  })
  @IsString()
  productCode: string;

  @ApiProperty({
    description: 'Cantidad de unidades a vender',
    example: 10,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;
}
