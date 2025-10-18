import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/entities/Role.entity';
import { User } from 'src/entities/User.entity';
import { Repository } from 'typeorm';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { AuthUser } from './interfaces/auth-user.interface';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}
  async register(RegisterDTO: RegisterDTO) {
    const { name, email, password, roleId } = RegisterDTO;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role_id: roleId,
      state_id: 1,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Generar JWT
    const payload = {
      sub: savedUser.user_id,
      email: savedUser.email,
      roleId,
      name: savedUser.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser.user_id,
        name: savedUser.name,
        email: savedUser.email,
        roleId,
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
      roleId: user.role.role_id,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        roleId: user.role.role_id,
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
