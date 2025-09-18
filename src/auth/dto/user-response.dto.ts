import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDTO {
  @ApiProperty({
    description: 'ID único del usuario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'johndoe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario',
    example: 'Auxiliar',
  })
  role: string;
}
