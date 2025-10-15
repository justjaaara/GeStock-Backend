import { MailerService } from '@nestjs-modules/mailer';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/entities/Role.entity';
import { User } from 'src/entities/User.entity';
import { Repository } from 'typeorm';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthUser } from './interfaces/auth-user.interface';
import { PasswordResetPayload } from './interfaces/password-reset-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}
  async register(RegisterDTO: RegisterDTO) {
    const { name, email, password } = RegisterDTO;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const defaultRole = await this.roleRepository.findOne({
      where: { role_id: 2 },
    }); // Role_Id 2 = Usuario
    if (!defaultRole) {
      throw new Error('Rol por defecto no encontrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role_id: defaultRole.role_id,
      state_id: 1,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Generar JWT
    const payload = {
      sub: savedUser.user_id,
      email: savedUser.email,
      role: defaultRole.role_name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser.user_id,
        name: savedUser.name,
        email: savedUser.email,
        role: defaultRole.role_name,
      },
    };
  }

  async login(loginDTO: LoginDTO) {
    const { email, password } = loginDTO;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.state_id !== 1) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.role.role_name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role.role_name,
      },
    };
  }

  async validateUser(userId: number): Promise<AuthUser | null> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['role'],
    });

    if (user && user.state_id === 1) {
      return {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role.role_name,
      };
    }
    return null;
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        this.logger.warn(
          `Intento de restablecimiento de contraseña para un email no registrado: ${email}`,
        );
        return {
          message:
            'Si el email existe, recibirás un correo con las instrucciones',
        };
      }

      if (user.state_id !== 1) {
        this.logger.warn(`Intento de reset para usuario inactivo: ${email}`);
        return {
          message:
            'Si el email existe, recibirás un correo con las instrucciones',
        };
      }

      const resetToken = this.jwtService.sign(
        {
          userId: user.user_id,
          email: user.email,
          type: 'password-reset',
        },
        {
          secret: process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
          expiresIn: '20min',
        },
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Restablecimiento de contraseña',
        template: 'reset-password', // Asegúrate de tener esta plantilla en tu configuración de mailer
        context: {
          name: user.name,
          resetUrl,
        },
      });

      this.logger.log(`✅ Email de recuperación enviado a: ${user.email}`);

      return {
        message:
          'Si el email existe, recibirás un correo con las instrucciones',
      };
    } catch (error) {
      this.logger.error(
        `❌ Error en forgotPassword para email: ${error instanceof Error && error.message ? error.message : String(error)}`,
        error instanceof Error && error.stack ? error.stack : '',
      );
      throw new Error(
        'Error al procesar la solicitud de restablecimiento de contraseña',
      );
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    try {
      const payload = this.jwtService.verify<PasswordResetPayload>(token, {
        secret: process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
      });

      if (payload.type !== 'password-reset') {
        this.logger.warn('Intento de reset con token de tipo incorrecto');
        throw new UnauthorizedException('Token inválido');
      }

      // Buscar usuario por ID del payload
      const user = await this.userRepository.findOne({
        where: { user_id: payload.userId },
      });

      if (!user) {
        this.logger.warn(`Usuario no encontrado para: ID ${payload.userId}`);
        throw new NotFoundException('Usuario no encontrado');
      }

      if (user.email !== payload.email) {
        this.logger.warn(
          `Email del token no coincide con el del usuario: ${payload.email}`,
        );
        throw new UnauthorizedException('Token inválido');
      }

      if (user.state_id !== 1) {
        this.logger.warn(
          `Intento de reset para usuario inactivo: ${user.email}`,
        );
        throw new UnauthorizedException('Usuario inactivo');
      }

      const hasedPassword = await bcrypt.hash(newPassword, 10);

      await this.userRepository.update(user.user_id, {
        password: hasedPassword,
      });

      this.logger.log(`Contraseña restablecida para usuario: ${user.email}`);

      return {
        message: 'Contraseña restablecida exitosamente',
      };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        typeof (error as { name: unknown }).name === 'string'
      ) {
        if ((error as { name: string }).name === 'JsonWebTokenError') {
          this.logger.warn('Token JWT invalido recibido');
          throw new UnauthorizedException('Token inválido');
        }

        if ((error as { name: string }).name === 'TokenExpiredError') {
          this.logger.warn('Token JWT expirado recibido');
          throw new UnauthorizedException('Token expirado');
        }
      }
      return {
        message: 'No se pudo restablecer la contraseña',
      };
    }
  }
}
