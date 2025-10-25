import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsOptional()
  lotId?: number | null;

  @IsNumber()
  quantity: number;

  @IsString()
  productCode: string;

  @IsNumber()
  userId: number;

  @IsString()
  type: 'ENTRADA' | 'SALIDA';
}
