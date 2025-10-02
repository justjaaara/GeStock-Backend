import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/interfaces/request.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Request() req: AuthRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    console.log('🔄 Solicitud de cambio de contraseña recibida');

    const userId = req.user.id;

    if (!userId || typeof userId !== 'number') {
      throw new BadRequestException(`ID de usuario inválido: ${userId}`);
    }

    return this.usersService.changePassword(userId, changePasswordDto);
  }
}
