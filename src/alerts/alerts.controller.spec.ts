import { Test, TestingModule } from '@nestjs/testing';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('AlertsController', () => {
  let controller: AlertsController;
  let service: AlertsService;

  const mockAlertsService = {
    getAllStockAlerts: jest.fn(),
    getAlertStats: jest.fn(),
    getCriticalAlerts: jest.fn(),
    getOutOfStockAlerts: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [
        {
          provide: AlertsService,
          useValue: mockAlertsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AlertsController>(AlertsController);
    service = module.get<AlertsService>(AlertsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStockAlerts', () => {
    it('debería retornar todas las alertas de stock formateadas', async () => {
      const mockAlerts = [
        {
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
        },
      ];

      mockAlertsService.getAllStockAlerts.mockResolvedValue(mockAlerts);

      const result = await controller.getAllStockAlerts();

      expect(mockAlertsService.getAllStockAlerts).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('productId', 1);
      expect(result[0]).toHaveProperty('alertType', 'Crítico');
      expect(result[0]).toHaveProperty('priority', 'media');
    });

    it('debería retornar alertas sin stock con prioridad alta', async () => {
      const mockAlerts = [
        {
          productId: 2,
          productCode: 'PROD-002',
          productName: 'Producto 2',
          productDescription: 'Descripción 2',
          productCategory: 'Categoría 2',
          currentStock: 0,
          minimumStock: 10,
          deficit: 10,
          unitPrice: 200,
          productState: 'Activo',
          measurementType: 'Unidad',
          lotId: 2,
          alertDate: new Date(),
        },
      ];

      mockAlertsService.getAllStockAlerts.mockResolvedValue(mockAlerts);

      const result = await controller.getAllStockAlerts();

      expect(result[0]).toHaveProperty('alertType', 'Sin Stock');
      expect(result[0]).toHaveProperty('priority', 'alta');
    });
  });

  describe('getAlertStats', () => {
    it('debería retornar las estadísticas de alertas', async () => {
      const mockStats = {
        totalAlerts: 10,
        criticalAlerts: 5,
        outOfStockAlerts: 2,
        minimumStockAlerts: 3,
      };

      mockAlertsService.getAlertStats.mockResolvedValue(mockStats);

      const result = await controller.getAlertStats();

      expect(mockAlertsService.getAlertStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('getCriticalAlerts', () => {
    it('debería retornar alertas críticas formateadas', async () => {
      const mockAlerts = [
        {
          productId: 3,
          productCode: 'PROD-003',
          productName: 'Producto 3',
          productDescription: 'Descripción 3',
          productCategory: 'Categoría 3',
          currentStock: 3,
          minimumStock: 10,
          deficit: 7,
          unitPrice: 150,
          productState: 'Activo',
          measurementType: 'Unidad',
          lotId: 3,
          alertDate: new Date(),
        },
      ];

      mockAlertsService.getCriticalAlerts.mockResolvedValue(mockAlerts);

      const result = await controller.getCriticalAlerts();

      expect(mockAlertsService.getCriticalAlerts).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('productId', 3);
      expect(result[0]).toHaveProperty('currentStock', 3);
      expect(result[0]).toHaveProperty('minimumStock', 10);
    });
  });

  describe('getOutOfStockAlerts', () => {
    it('debería retornar alertas de productos sin stock formateadas', async () => {
      const mockAlerts = [
        {
          productId: 4,
          productCode: 'PROD-004',
          productName: 'Producto 4',
          productDescription: 'Descripción 4',
          productCategory: 'Categoría 4',
          currentStock: 0,
          minimumStock: 5,
          deficit: 5,
          unitPrice: 50,
          productState: 'Activo',
          measurementType: 'Unidad',
          lotId: 4,
          alertDate: new Date(),
        },
      ];

      mockAlertsService.getOutOfStockAlerts.mockResolvedValue(mockAlerts);

      const result = await controller.getOutOfStockAlerts();

      expect(mockAlertsService.getOutOfStockAlerts).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('productId', 4);
      // Controller for out-of-stock returns minimumStock (no currentStock in response)
      expect(result[0]).toHaveProperty('minimumStock', 5);
    });
  });
});
