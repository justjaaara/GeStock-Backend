import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAllExceptCurrent: jest.fn(),
    updateUserRole: jest.fn(),
    toggleUserState: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('debería retornar todos los usuarios excepto el actual', async () => {
      const mockRequest = { user: { id: 1 } };
      const mockUsers = [
        {
          userId: 2,
          name: 'Usuario 2',
          email: 'user2@example.com',
          roleName: 'User',
          roleId: 2,
          stateName: 'Activo',
          stateId: 1,
        },
      ];

      mockUsersService.findAllExceptCurrent.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers(mockRequest);

      expect(mockUsersService.findAllExceptCurrent).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 2);
      expect(result[0]).toHaveProperty('name', 'Usuario 2');
    });
  });

  describe('updateUserRole', () => {
    it('debería actualizar el rol de un usuario', async () => {
      const userId = 2;
      const roleId = 3;
      const mockResponse = { message: 'Rol actualizado exitosamente' };

      mockUsersService.updateUserRole.mockResolvedValue(mockResponse);

      const result = await controller.updateUserRole(userId, roleId);

      expect(mockUsersService.updateUserRole).toHaveBeenCalledWith(
        userId,
        roleId,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('toggleUserState', () => {
    it('debería cambiar el estado de un usuario', async () => {
      const userId = 2;
      const mockResponse = { message: 'Estado actualizado exitosamente' };

      mockUsersService.toggleUserState.mockResolvedValue(mockResponse);

      const result = await controller.toggleUserState(userId);

      expect(mockUsersService.toggleUserState).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('changePassword', () => {
    it('debería cambiar la contraseña del usuario', async () => {
      const mockRequest = { user: { id: 1 } };
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
      };
      const mockResponse = { message: 'Contraseña cambiada exitosamente' };

      mockUsersService.changePassword.mockResolvedValue(mockResponse);

      const result = await controller.changePassword(
        mockRequest,
        changePasswordDto,
      );

      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        1,
        changePasswordDto,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
