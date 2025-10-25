import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/entities/Role.entity';
import { UsersService } from 'src/users/users.service'; // ✅ Reutilizar UserService
import { Repository } from 'typeorm';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { AuthUser } from './interfaces/auth-user.interface';
import { EmailNotificationService } from './email-notification.service';
import { AuthUserValidator } from './validators/auth-user.validator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService, // ✅ Inyectar UserService
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailNotificationService,
    private configService: ConfigService, // ✅ Inyectar ConfigService
  ) {}

  async register(RegisterDTO: RegisterDTO) {
    const { name, email, password } = RegisterDTO;

    this.logger.log(`📝 Intento de registro: ${email}`);

    // ✅ Usar UserService para verificar email
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const defaultRole = await this.roleRepository.findOne({
      where: { role_id: 2 },
    });
    if (!defaultRole) {
      throw new Error('Rol por defecto no encontrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Usar UserService para crear usuario
    const newUser = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      role_id: defaultRole.role_id,
      state_id: 1,
    });

    this.logger.log(`✅ Usuario registrado: ${email}`);

    // Enviar email de bienvenida
    this.emailService.sendWelcomeEmail(email, name).catch((err) => {
      this.logger.error('Error enviando email de bienvenida', err);
    });

    const payload = {
      sub: newUser.user_id,
      email: newUser.email,
      role: defaultRole.role_name,
      roleId: defaultRole.role_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: defaultRole.role_name,
        roleId: defaultRole.role_id,
      },
    };
  }

  async login(loginDTO: LoginDTO) {
    const { email, password } = loginDTO;

    this.logger.log(`🔐 Intento de login: ${email}`);

    // ✅ Usar UserService
    const user = await this.usersService.findByEmailWithRole(email);

    // ✅ Usar Validator para verificaciones
    AuthUserValidator.validateUserExists(user);
    await AuthUserValidator.validatePassword(password, user.password, bcrypt);
    AuthUserValidator.validateUserActive(user);

    this.logger.log(`✅ Login exitoso: ${email}`);

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.role.role_name,
      roleId: user.role.role_id,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role.role_name,
        roleId: user.role.role_id,
      },
    };
  }

  async validateUser(userId: number): Promise<AuthUser | null> {
    // ✅ Usar UserService
    const user = await this.usersService.findActiveUser(userId);

    if (user) {
      return {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role.role_name,
        roleId: user.role.role_id,
      };
    }

    return null;
  }
}
