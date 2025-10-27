import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthRequest } from '../interfaces/request.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    // Verificar que el usuario existe y tiene el role_id = 1 (ADMIN)
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar que el rol sea ADMIN (puede ser role_name o role_id)
    const isAdmin = user.role === 'ADMIN' || user.roleId === 1;

    if (!isAdmin) {
      throw new ForbiddenException(
        'Acceso denegado. Solo los administradores pueden realizar esta acción',
      );
    }

    return true;
  }
}
