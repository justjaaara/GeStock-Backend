import { RegisterDTO } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from 'src/entities/Role.entity';
import { User } from 'src/entities/User.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/login.dto';
import { AuthUser } from './interfaces/auth-user.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('ROLE_REPOSITORY')
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
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
}
