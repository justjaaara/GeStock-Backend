import { ApiProperty } from '@nestjs/swagger';

export class ClosureHeaderResponseDto {
  @ApiProperty({
    example: 123,
    description: 'ID del encabezado del cierre',
  })
  headerId: number;

  @ApiProperty({
    example: '2025-10-26T14:30:00Z',
    description: 'Fecha y hora del cierre',
  })
  closureDate: Date;

  @ApiProperty({
    example: 10,
    description: 'Mes del cierre',
  })
  closureMonth: number;

  @ApiProperty({
    example: 2025,
    description: 'Año del cierre',
  })
  closureYear: number;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del usuario que realizó el cierre',
  })
  userName: string;

  @ApiProperty({
    example: 'COMPLETADO',
    description: 'Estado del cierre',
  })
  status: string;
}
