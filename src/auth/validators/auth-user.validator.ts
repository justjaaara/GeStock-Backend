import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/entities/User.entity';

/**
 * Validador de reglas de negocio para usuarios en el contexto de autenticación
 */
export class AuthUserValidator {
  /**
   * Valida que el usuario exista
   * @param user - Usuario a validar (puede ser null)
   * @throws NotFoundException si el usuario no existe
   */
  static validateUserExists(user: User | null): asserts user is User {
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  /**
   * Valida que el usuario esté activo
   * @param user - Usuario a validar
   * @throws ForbiddenException si el usuario está inactivo
   */
  static validateUserActive(user: User): void {
    if (user.state_id !== 1) {
      throw new ForbiddenException('Usuario inactivo o suspendido');
    }
  }

  /**
   * Valida que la contraseña coincida con el hash
   * @param plainPassword - Contraseña en texto plano
   * @param hashedPassword - Hash de la contraseña almacenada
   * @param bcrypt - Librería bcrypt para comparación
   * @throws UnauthorizedException si la contraseña no coincide
   */
  static async validatePassword(
    plainPassword: string,
    hashedPassword: string,
    bcrypt: { compare(data: string, encrypted: string): Promise<boolean> },
  ): Promise<void> {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  /**
   * Valida que el userId del token coincida con el de la base de datos
   * @param tokenUserId - ID de usuario del token JWT
   * @param dbUserId - ID de usuario de la base de datos
   * @throws UnauthorizedException si los IDs no coinciden
   */
  static validateTokenUserId(tokenUserId: number, dbUserId: number): void {
    if (tokenUserId !== dbUserId) {
      throw new UnauthorizedException(
        'Token inválido: ID de usuario no coincide',
      );
    }
  }

  /**
   * Valida que el email tenga un formato válido
   * @param email - Email a validar
   * @throws UnauthorizedException si el formato es inválido
   */
  static validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new UnauthorizedException('Formato de email inválido');
    }
  }

  /**
   * Valida que el usuario tenga un rol específico
   * @param user - Usuario a validar
   * @param requiredRole - Rol requerido
   * @throws ForbiddenException si el usuario no tiene el rol
   */
  static validateUserRole(user: User, requiredRole: string): void {
    if (!user.role || user.role.role_name !== requiredRole) {
      throw new ForbiddenException(
        `Acceso denegado: se requiere el rol de ${requiredRole}`,
      );
    }
  }

  /**
   * Valida múltiples condiciones del usuario en una sola llamada
   * @param user - Usuario a validar
   * @param options - Opciones de validación
   */
  static validateUser(
    user: User | null,
    options: {
      checkExists?: boolean;
      checkActive?: boolean;
      requiredRole?: string;
    } = {},
  ): asserts user is User {
    const { checkExists = true, checkActive = true, requiredRole } = options;

    if (checkExists) {
      this.validateUserExists(user);
    }

    // At this point, if checkExists was true, user is guaranteed to be User
    // If checkExists was false, we trust the caller that user is not null
    if (checkActive && user) {
      this.validateUserActive(user);
    }

    if (requiredRole && user) {
      this.validateUserRole(user, requiredRole);
    }
  }
}
