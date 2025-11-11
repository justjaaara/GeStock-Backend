import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '../entities/Role.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { ConflictException } from '@nestjs/common';
import { EmailNotificationService } from './email-notification.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let roleRepository: any;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByEmailWithRole: jest.fn(),
    findActiveUser: jest.fn(),
    create: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockEmailService = {
    sendWelcomeEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailNotificationService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    roleRepository = module.get(getRepositoryToken(Role));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería registrar un usuario exitosamente', async () => {
      const registerDto: RegisterDTO = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        roleId: 2,
      };

      const mockRole = { role_id: 2, role_name: 'User' };
      const mockUser = {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token');

      // Mock bcrypt.hash to return hashed password
      (bcrypt as any).hash.mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { role_id: 2 },
      });
      expect(mockUsersService.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: expect.any(String),
        role_id: 2,
        state_id: 1,
      });
      expect(result).toHaveProperty('access_token', 'token');
      expect(result.user).toHaveProperty('id', 1);
    });

    it('debería lanzar error si el email ya existe', async () => {
      const registerDto: RegisterDTO = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        roleId: 2,
      };

      mockUsersService.findByEmail.mockResolvedValue({
        email: 'existing@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('debería iniciar sesión exitosamente', async () => {
      const loginDto: LoginDTO = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        role: { role_id: 2, role_name: 'User' },
        state_id: 1,
      };

      mockUsersService.findByEmailWithRole.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token');

      // Mock bcrypt.compare to return true
      (bcrypt as any).compare.mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(mockUsersService.findByEmailWithRole).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result).toHaveProperty('access_token', 'token');
      expect(result.user).toHaveProperty('id', 1);
    });
  });

  describe('validateUser', () => {
    it('debería validar usuario activo', async () => {
      const mockUser = {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { role_id: 2, role_name: 'User' },
      };

      mockUsersService.findActiveUser.mockResolvedValue(mockUser);

      const result = await service.validateUser(1);

      expect(mockUsersService.findActiveUser).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('role', 'User');
    });

    it('debería retornar null si usuario no existe', async () => {
      mockUsersService.findActiveUser.mockResolvedValue(null);

      const result = await service.validateUser(999);

      expect(result).toBeNull();
    });
  });
});
