import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let passwordResetService: PasswordResetService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockPasswordResetService = {
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: PasswordResetService,
          useValue: mockPasswordResetService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    passwordResetService =
      module.get<PasswordResetService>(PasswordResetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const registerDto: RegisterDTO = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        roleId: 2,
      };

      const expectedResponse = {
        access_token: 'token',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'User',
          roleId: 2,
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    it('debería iniciar sesión exitosamente', async () => {
      const loginDto: LoginDTO = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        access_token: 'token',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'User',
          roleId: 2,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getProfile', () => {
    it('debería retornar el perfil del usuario autenticado', () => {
      const mockRequest = {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'User',
          roleId: 2,
        },
      };

      const result = controller.getProfile(mockRequest as any);

      expect(result).toEqual(mockRequest.user);
    });
  });

  describe('forgotPassword', () => {
    it('debería solicitar restablecimiento de contraseña', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      const expectedResponse = { message: 'Email enviado' };
      mockPasswordResetService.requestPasswordReset.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.forgotPassword(
        forgotPasswordDto,
        '127.0.0.1',
      );

      expect(
        mockPasswordResetService.requestPasswordReset,
      ).toHaveBeenCalledWith(forgotPasswordDto, '127.0.0.1');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('resetPassword', () => {
    it('debería restablecer la contraseña exitosamente', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'reset-token',
        newPassword: 'newpassword123',
      };

      const expectedResponse = { message: 'Contraseña restablecida' };
      mockPasswordResetService.resetPassword.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.resetPassword(
        resetPasswordDto,
        '127.0.0.1',
      );

      expect(mockPasswordResetService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto,
        '127.0.0.1',
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
