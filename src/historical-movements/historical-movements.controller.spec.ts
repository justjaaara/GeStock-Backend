import { Test, TestingModule } from '@nestjs/testing';
import { HistoricalMovementsController } from './historical-movements.controller';
import { HistoricalMovementsService } from './historical-movements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationDto } from '../inventory/dto/pagination.dto';

describe('HistoricalMovementsController', () => {
  let controller: HistoricalMovementsController;
  let service: HistoricalMovementsService;

  const mockHistoricalMovementsService = {
    getHistoricalMovements: jest.fn(),
    getHistoricalMovementsByProduct: jest.fn(),
    getHistoricalMovementsByType: jest.fn(),
    getHistoricalMovementsFiltered: jest.fn(),
    getHistoricalMovementsByReason: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoricalMovementsController],
      providers: [
        {
          provide: HistoricalMovementsService,
          useValue: mockHistoricalMovementsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<HistoricalMovementsController>(
      HistoricalMovementsController,
    );
    service = module.get<HistoricalMovementsService>(
      HistoricalMovementsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHistoricalMovements', () => {
    it('debería retornar movimientos históricos paginados', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const mockResponse = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockHistoricalMovementsService.getHistoricalMovements.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getHistoricalMovements(paginationDto);

      expect(
        mockHistoricalMovementsService.getHistoricalMovements,
      ).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getHistoricalMovementsByProduct', () => {
    it('debería retornar movimientos por producto', async () => {
      const productName = 'Coca Cola 500ml';
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const mockResponse = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockHistoricalMovementsService.getHistoricalMovementsByProduct.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getHistoricalMovementsByProduct(
        productName,
        paginationDto,
      );

      expect(
        mockHistoricalMovementsService.getHistoricalMovementsByProduct,
      ).toHaveBeenCalledWith(productName, paginationDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getHistoricalMovementsByType', () => {
    it('debería retornar movimientos por tipo', async () => {
      const movementType = 'ENTRADA' as const;
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const mockResponse = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockHistoricalMovementsService.getHistoricalMovementsByType.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getHistoricalMovementsByType(
        movementType,
        paginationDto,
      );

      expect(
        mockHistoricalMovementsService.getHistoricalMovementsByType,
      ).toHaveBeenCalledWith(movementType, paginationDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getHistoricalMovementsFiltered', () => {
    it('debería retornar movimientos filtrados', async () => {
      const filterDto = {
        productName: 'Coca Cola',
        movementType: 'SALIDA' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const mockResponse = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockHistoricalMovementsService.getHistoricalMovementsFiltered.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.getHistoricalMovementsFiltered(
        filterDto,
        paginationDto,
      );

      expect(
        mockHistoricalMovementsService.getHistoricalMovementsFiltered,
      ).toHaveBeenCalledWith({
        productName: 'Coca Cola',
        movementType: 'SALIDA',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        paginationDto,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getHistoricalMovementsByReason', () => {
    it('debería retornar movimientos por razón de venta', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const mockResponse = {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockHistoricalMovementsService.getHistoricalMovementsByReason.mockResolvedValue(
        mockResponse,
      );

      const result =
        await controller.getHistoricalMovementsByReason(paginationDto);

      expect(
        mockHistoricalMovementsService.getHistoricalMovementsByReason,
      ).toHaveBeenCalledWith('VENTA', paginationDto);
      expect(result).toEqual(mockResponse);
    });
  });
});
