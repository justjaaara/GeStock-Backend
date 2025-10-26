import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterSalesByDateRangeDto {
  @ApiPropertyOptional({
    description: 'Fecha inicial del rango (ISO 8601)',
    format: 'date',
    example: '2025-10-20',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha final del rango (ISO 8601)',
    format: 'date',
    example: '2025-10-25',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
