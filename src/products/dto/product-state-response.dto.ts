import { ApiProperty } from '@nestjs/swagger';

export class ProductStateResponseDto {
  @ApiProperty({ example: 1, description: 'ID del estado' })
  stateId: number;

  @ApiProperty({ example: 'Activo', description: 'Nombre del estado' })
  stateName: string;
}

export class MeasurementTypeResponseDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de medida' })
  measurementId: number;

  @ApiProperty({ example: 'Unidad', description: 'Nombre del tipo de medida' })
  measurementName: string;
}
