import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/User.entity';
import { UserManagementView } from 'src/entities/User-management-view.entity';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserManagementView)
    private readonly userManagementViewRepository: Repository<UserManagementView>,
  ) {}

  /**
   * Busca un usuario por email
   * @param email - Email del usuario
   * @returns Usuario encontrado o null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Busca un usuario por email con su rol
   * @param email - Email del usuario
   * @returns Usuario con rol o null
   */
  async findByEmailWithRole(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  /**
   * Busca un usuario activo por ID
   * @param userId - ID del usuario
   * @returns Usuario activo con rol o null
   */
  async findActiveUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { user_id: userId, state_id: 1 },
      relations: ['role'],
    });
  }

  /**
   * Crea un nuevo usuario
   * @param userData - Datos del usuario a crear
   * @returns Usuario creado
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  /**
   * Actualiza la contraseña de un usuario
   * @param userId - ID del usuario
   * @param hashedPassword - Contraseña hasheada
   * @throws NotFoundException si el usuario no existe
   */
  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    const result = await this.userRepository.update(
      { user_id: userId },
      { password: hashedPassword },
    );

    if (result.affected === 0) {
      this.logger.warn(`⚠️ Usuario con ID ${userId} no encontrado`);
      throw new NotFoundException('Usuario no encontrado');
    }

    this.logger.log(`✅ Contraseña actualizada para usuario ID: ${userId}`);
  }

  /**
   * Busca un usuario por ID
   * @param userId - ID del usuario
   * @returns Usuario encontrado
   * @throws NotFoundException si el usuario no existe
   */
  async findById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return user;
  }

  /**
   * Cambia la contraseña de un usuario
   * @param userId - ID del usuario
   * @param changePasswordDto - DTO con contraseña actual y nueva
   * @throws NotFoundException si el usuario no existe
   * @throws UnauthorizedException si la contraseña actual es incorrecta
   */
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    this.logger.log(`🔄 Cambiando contraseña para usuario ID: ${userId}`);

    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      this.logger.warn(`⚠️ Usuario con ID ${userId} no encontrado`);
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      this.logger.warn(
        `⚠️ Contraseña actual incorrecta para usuario ID: ${userId}`,
      );
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await this.userRepository.update(
      { user_id: userId },
      { password: hashedPassword },
    );

    this.logger.log(`✅ Contraseña actualizada para usuario ID: ${userId}`);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Obtiene todos los usuarios excepto el usuario actual usando la vista
   * @param currentUserId - ID del usuario actual (admin)
   * @returns Lista de usuarios con sus roles y estados desde la vista
   */
  async findAllExceptCurrent(
    currentUserId: number,
  ): Promise<UserManagementView[]> {
    this.logger.log(
      `📋 Obteniendo todos los usuarios excepto ID: ${currentUserId} desde vista`,
    );

    return this.userManagementViewRepository
      .createQueryBuilder('view')
      .where('view.userId != :currentUserId', { currentUserId })
      .orderBy('view.userId', 'ASC')
      .getMany();
  }

  /**
   * Actualiza el rol de un usuario
   * @param userId - ID del usuario a actualizar
   * @param newRoleId - Nuevo ID del rol
   * @throws NotFoundException si el usuario no existe
   * @throws Error si el rol no existe
   */
  async updateUserRole(
    userId: number,
    newRoleId: number,
  ): Promise<{ message: string }> {
    this.logger.log(
      `🔄 Actualizando rol del usuario ID: ${userId} a rol ID: ${newRoleId}`,
    );

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['role'],
    });

    if (!user) {
      this.logger.warn(`⚠️ Usuario con ID ${userId} no encontrado`);
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Actualizar el rol
    await this.userRepository.update(
      { user_id: userId },
      { role_id: newRoleId },
    );

    this.logger.log(
      `✅ Rol actualizado para usuario ID: ${userId} al rol ID: ${newRoleId}`,
    );

    return { message: 'Rol actualizado exitosamente' };
  }

  /**
   * Cambia el estado de un usuario (activar/desactivar)
   * @param userId - ID del usuario a cambiar de estado
   * @throws NotFoundException si el usuario no existe
   */
  async toggleUserState(
    userId: number,
  ): Promise<{ message: string; newStateId: number; newStateName: string }> {
    this.logger.log(`🔄 Cambiando estado del usuario ID: ${userId}`);

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['state'],
    });

    if (!user) {
      this.logger.warn(`⚠️ Usuario con ID ${userId} no encontrado`);
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Cambiar el estado: si está activo (1) -> inactivo (2), si está inactivo (2) -> activo (1)
    const newStateId = user.state_id === 1 ? 2 : 1;
    const newStateName = newStateId === 1 ? 'Activo' : 'Inactivo';

    // Actualizar el estado
    await this.userRepository.update(
      { user_id: userId },
      { state_id: newStateId },
    );

    this.logger.log(
      `✅ Estado actualizado para usuario ID: ${userId} a estado ID: ${newStateId} (${newStateName})`,
    );

    return {
      message: `Usuario ${newStateName === 'Activo' ? 'activado' : 'desactivado'} exitosamente`,
      newStateId,
      newStateName,
    };
  }
}
