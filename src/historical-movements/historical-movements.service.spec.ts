import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HistoricalMovementsService } from './historical-movements.service';
import { HistoricalMovements } from '../entities/Historical-movements.entity';
import { PaginationDto } from '../inventory/dto/pagination.dto';

describe('HistoricalMovementsService', () => {
  let service: HistoricalMovementsService;
  let mockRepository: any;

  const mockHistoricalMovement = {
    id: 1,
    productName: 'Coca Cola 500ml',
    movementType: 'SALIDA',
    quantity: 10,
    movementDate: new Date(),
    movementReason: 'VENTA',
  };

  beforeEach(async () => {
    mockRepository = {
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoricalMovementsService,
        {
          provide: getRepositoryToken(HistoricalMovements),
          useValue: mockRepository,
        },
      ],
    }).compile();

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
      const mockData = [[mockHistoricalMovement], 1];

      mockRepository.findAndCount.mockResolvedValue(mockData);

      const result = await service.getHistoricalMovements(paginationDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        order: {
          movementDate: 'DESC',
        },
      });
      expect(result.data).toEqual([mockHistoricalMovement]);
      expect(result.pagination.totalItems).toBe(1);
    });
  });

  describe('getHistoricalMovementsByProduct', () => {
    it('debería retornar movimientos por producto', async () => {
      const productName = 'Coca Cola 500ml';
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const mockData = [[mockHistoricalMovement], 1];

      mockRepository.findAndCount.mockResolvedValue(mockData);

      const result = await service.getHistoricalMovementsByProduct(
        productName,
        paginationDto,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { productName },
        skip: 0,
        take: 20,
        order: {
          movementDate: 'DESC',
        },
      });
      expect(result.data).toEqual([mockHistoricalMovement]);
    });
  });

  describe('getHistoricalMovementsByType', () => {
    it('debería retornar movimientos por tipo', async () => {
      const movementType = 'ENTRADA' as const;
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const mockData = [[mockHistoricalMovement], 1];

      mockRepository.findAndCount.mockResolvedValue(mockData);

      const result = await service.getHistoricalMovementsByType(
        movementType,
        paginationDto,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { movementType },
        skip: 0,
        take: 20,
        order: {
          movementDate: 'DESC',
        },
      });
      expect(result.data).toEqual([mockHistoricalMovement]);
    });
  });

  describe('getHistoricalMovementsFiltered', () => {
    it('debería retornar movimientos filtrados', async () => {
      const filters = {
        productName: 'Coca Cola',
        movementType: 'SALIDA' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        paginationDto: { page: 1, limit: 20 },
      };
      const mockData = [[mockHistoricalMovement], 1];
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue(mockData),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getHistoricalMovementsFiltered(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'historical_movements.PRODUCT_NAME = :productName',
        { productName: 'Coca Cola' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'historical_movements.MOVEMENT_TYPE = :movementType',
        { movementType: 'SALIDA' },
      );
      expect(result.data).toEqual([mockHistoricalMovement]);
    });
  });

  describe('getHistoricalMovementsByReason', () => {
    it('debería retornar movimientos por razón', async () => {
      const movementReason = 'VENTA';
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const mockData = [[mockHistoricalMovement], 1];

      mockRepository.findAndCount.mockResolvedValue(mockData);

      const result = await service.getHistoricalMovementsByReason(
        movementReason,
        paginationDto,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { movementReason },
        skip: 0,
        take: 20,
        order: {
          movementDate: 'DESC',
        },
      });
      expect(result.data).toEqual([mockHistoricalMovement]);
    });
  });
});
