import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<number[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
    }>();
    const user = request.user;

    if (!user || !user.roleId) {
      throw new ForbiddenException(
        'No tienes los permisos necesarios para acceder a este recurso',
      );
    }

    const hasRole = requiredRoles.includes(user.roleId);

    if (!hasRole) {
      throw new ForbiddenException(
        'No tienes los permisos necesarios para acceder a este recurso',
      );
    }

    return true;
  }
}
