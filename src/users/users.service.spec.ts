import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/User.entity';
import { UserManagementView } from '../entities/User-management-view.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;
  let mockUserManagementViewRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    mockUserManagementViewRepository = {
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserManagementView),
          useValue: mockUserManagementViewRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('debería encontrar un usuario por email', async () => {
      const email = 'test@example.com';
      const mockUser = { id: 1, email, name: 'Test User' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('debería retornar null si no encuentra el usuario', async () => {
      const email = 'notfound@example.com';

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findByEmailWithRole', () => {
    it('debería encontrar un usuario con su rol', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 1,
        email,
        name: 'Test User',
        role: { role_id: 2, role_name: 'User' },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmailWithRole(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        relations: ['role'],
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findActiveUser', () => {
    it('debería encontrar un usuario activo por ID', async () => {
      const userId = 1;
      const mockUser = {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: { role_id: 2, role_name: 'User' },
        state_id: 1,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findActiveUser(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, state_id: 1 },
        relations: ['role'],
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('debería crear un nuevo usuario', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'hashedpass',
        role_id: 2,
        state_id: 1,
      };
      const mockUser = { user_id: 1, ...userData };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(userData);

      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAllExceptCurrent', () => {
    it('debería retornar todos los usuarios excepto el actual', async () => {
      const currentUserId = 1;
      const mockUsers = [
        {
          userId: 2,
          name: 'User 2',
          email: 'user2@example.com',
          roleName: 'User',
          roleId: 2,
          stateName: 'Activo',
          stateId: 1,
        },
      ];

      // Prepare a single mocked query builder and make the repository return it
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      };
      mockUserManagementViewRepository.createQueryBuilder.mockReturnValue(
        mockQb,
      );

      const result = await service.findAllExceptCurrent(currentUserId);

      expect(
        mockUserManagementViewRepository.createQueryBuilder,
      ).toHaveBeenCalledWith('view');
      expect(result).toEqual(mockUsers);
    });
  });

  describe('updateUserRole', () => {
    it('debería actualizar el rol de un usuario', async () => {
      const userId = 2;
      const roleId = 3;
      const mockResult = { affected: 1 };

      // Ensure the user exists before updating role
      mockUserRepository.findOne.mockResolvedValue({ user_id: userId });
      mockUserRepository.update.mockResolvedValue(mockResult);

      const result = await service.updateUserRole(userId, roleId);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { user_id: userId },
        { role_id: roleId },
      );
      expect(result.message).toContain('actualizado');
    });
  });

  describe('toggleUserState', () => {
    it('debería cambiar el estado de un usuario', async () => {
      const userId = 2;
      const mockUser = { user_id: 2, state_id: 1 };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.toggleUserState(userId);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { user_id: userId },
        { state_id: 2 }, // Toggle de 1 a 2
      );
      // Service returns 'Usuario activado/desactivado exitosamente'
      expect(result.message).toContain('exitosamente');
    });
  });

  describe('changePassword', () => {
    it('debería cambiar la contraseña de un usuario', async () => {
      const userId = 1;
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpass',
        newPassword: 'newpass',
      };
      const mockUser = {
        user_id: 1,
        password: '$2b$10$hashedoldpass',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      // Mock bcrypt used in the service
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      bcrypt.hash = jest.fn().mockResolvedValue('hashednewpass');

      const result = await service.changePassword(userId, changePasswordDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(mockUserRepository.update).toHaveBeenCalled();
      // Service returns 'Contraseña actualizada exitosamente'
      expect(result.message).toContain('actualizada');
    });
  });
});
