import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/User.entity';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
