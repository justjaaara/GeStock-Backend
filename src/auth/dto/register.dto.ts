import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDTO {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    maxLength: 25,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan@example.com',
    maxLength: 254,
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}
