import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import type { AuthRequest } from '../auth/interfaces/request.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAllUsers(@Request() req: AuthRequest) {
    const currentUserId = req.user.id;
    const users = await this.usersService.findAllExceptCurrent(currentUserId);

    // Los datos ya vienen de la vista, solo necesitamos transformar los nombres de propiedades
    return users.map((user) => ({
      id: user.userId,
      name: user.name,
      email: user.email,
      role: user.roleName,
      roleId: user.roleId,
      state: user.stateName,
      stateId: user.stateId,
    }));
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.usersService.updateUserRole(userId, roleId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/toggle-state')
  async toggleUserState(@Param('id', ParseIntPipe) userId: number) {
    return this.usersService.toggleUserState(userId);
  }

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
