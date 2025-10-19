import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsStrongPassword } from 'src/common/validators/strong-password.validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token para resetear la contraseña',
    example: 'abcdef123456',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: 'NewSecurePassword123!',
    minLength: 6,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  @MaxLength(50)
  newPassword: string;
}