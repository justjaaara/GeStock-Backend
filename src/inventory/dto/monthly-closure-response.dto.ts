import { ApiProperty } from '@nestjs/swagger';

export class MonthlyClosureResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación del cierre generado',
    example: 'Cierre mensual generado exitosamente para octubre 2025',
  })
  message: string;

  @ApiProperty({
    description: 'ID del encabezado del cierre creado',
    example: 123,
  })
  headerId: number;

  @ApiProperty({
    description: 'Mes del cierre',
    example: 10,
  })
  month: number;

  @ApiProperty({
    description: 'Año del cierre',
    example: 2025,
  })
  year: number;

  @ApiProperty({
    description: 'Fecha y hora de creación del cierre',
    example: '2025-10-26T14:30:00Z',
  })
  createdAt: Date;
}
