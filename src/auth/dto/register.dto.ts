import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsStrongPassword } from '../../common/validators/strong-password.validator';

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
    description:
      'Contraseña del usuario (debe tener al menos 6 caracteres, un número y un carácter especial)',
    example: 'Password123!',
    minLength: 6,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  @MaxLength(50)
  password: string;

  @ApiProperty({
    description: 'Rol del usuario que se va a crear (debe ser id: 1,2,3)',
    example: '1',
    maxItems: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([1, 2, 3])
  roleId: number;
}
