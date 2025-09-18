import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDTO } from './user-response.dto';

export class AuthResponseDTO {
  @ApiProperty({
    description: 'Token JWT para autenticación',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  access_token: string;

  @ApiProperty({
    description: 'Información del usuario autenticado',
    type: UserResponseDTO,
  })
  user: UserResponseDTO;
}
