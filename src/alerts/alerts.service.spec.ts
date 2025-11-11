import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { StockAlertView } from '../entities/Stock-alert-view.entity';

describe('AlertsService', () => {
  let service: AlertsService;
  let mockRepository: any;

  const mockStockAlertView = {
    productId: 1,
    productCode: 'PROD-001',
    productName: 'Producto 1',
    productDescription: 'Descripción 1',
    productCategory: 'Categoría 1',
    currentStock: 5,
    minimumStock: 10,
    deficit: 5,
    unitPrice: 100,
    productState: 'Activo',
    measurementType: 'Unidad',
    lotId: 1,
    alertDate: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: getRepositoryToken(StockAlertView),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStockAlerts', () => {
    it('debería obtener todas las alertas de stock ordenadas', async () => {
      const mockAlerts = [mockStockAlertView];
      mockRepository.find.mockResolvedValue(mockAlerts);

      const result = await service.getAllStockAlerts();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: {
          currentStock: 'ASC',
          deficit: 'DESC',
        },
      });
      expect(result).toEqual(mockAlerts);
    });
  });

  describe('getAlertStats', () => {
    it('debería calcular estadísticas de alertas correctamente', async () => {
      const mockAlerts = [
        { currentStock: 5, minimumStock: 10 }, // crítico
        { currentStock: 0, minimumStock: 10 }, // sin stock
        { currentStock: 10, minimumStock: 10 }, // mínimo
        { currentStock: 15, minimumStock: 10 }, // normal
      ];
      mockRepository.find.mockResolvedValue(mockAlerts);

      const result = await service.getAlertStats();

      expect(result).toEqual({
        totalAlerts: 4,
        criticalAlerts: 2,
        outOfStockAlerts: 1,
        minimumStockAlerts: 1,
      });
    });
  });

  describe('getCriticalAlerts', () => {
    it('debería obtener alertas críticas ordenadas por déficit', async () => {
      const mockAlerts = [mockStockAlertView];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockAlerts),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getCriticalAlerts();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'alert.currentStock < alert.minimumStock',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'alert.deficit',
        'DESC',
      );
      expect(result).toEqual(mockAlerts);
    });
  });

  describe('getOutOfStockAlerts', () => {
    it('debería obtener productos sin stock ordenados por nombre', async () => {
      const mockAlerts = [mockStockAlertView];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockAlerts),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getOutOfStockAlerts();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'alert.currentStock = 0',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'alert.productName',
        'ASC',
      );
      expect(result).toEqual(mockAlerts);
    });
  });
});
