import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { Product } from '../entities/Product.entity';
import { Inventory } from '../entities/Inventory.entity';
import { InventoryView } from '../entities/Inventory-view.entity';
import { HistoricalMovements } from '../entities/Historical-movements.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaginationDto } from '../inventory/dto/pagination.dto';

describe('SalesService', () => {
  let service: SalesService;
  let mockProductRepository: any;
  let mockInventoryRepository: any;
  let mockInventoryViewRepository: any;
  let mockHistoricalMovementsRepository: any;

  beforeEach(async () => {
    mockProductRepository = {
      findOne: jest.fn(),
    };
    mockInventoryRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      manager: {
        connection: {
          createQueryRunner: jest.fn(() => ({
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            query: jest.fn().mockResolvedValue(null),
          })),
        },
      },
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 1,
          productId: 1,
          currentStock: 10,
          batchId: 'BATCH-001',
          entryDate: new Date(),
        }),
      })),
    };
    mockInventoryViewRepository = {
      findOne: jest.fn(),
      query: jest.fn(),
    };
    mockHistoricalMovementsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        getRawOne: jest.fn().mockResolvedValue({ total: '100' }),
        getCount: jest.fn().mockResolvedValue(5),
      })),
      count: jest.fn().mockResolvedValue(50),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Inventory),
          useValue: mockInventoryRepository,
        },
        {
          provide: getRepositoryToken(InventoryView),
          useValue: mockInventoryViewRepository,
        },
        {
          provide: getRepositoryToken(HistoricalMovements),
          useValue: mockHistoricalMovementsRepository,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSale', () => {
    it('debería crear una venta exitosamente', async () => {
      const createSaleDto: CreateSaleDto = {
        productCode: 'PROD-001',
        quantity: 5,
      };
      const userId = 1;

      const mockProduct = {
        id: 1,
        productId: 1,
        productCode: 'PROD-001',
        productName: 'Producto 1',
      };
      const mockInventory = {
        id: 1,
        currentStock: 10,
        product: mockProduct,
      };

      // The repository queryRunner is used to call the stored procedure DESCARGAR_INVENTARIO
      // Ensure the lot returned by the queryBuilder has a lotId property
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockInventoryViewRepository.findOne.mockResolvedValue(mockInventory);
      mockInventoryRepository.createQueryBuilder().getOne.mockResolvedValue({
        lotId: 2,
        productId: 1,
      });

      const result = await service.createSale(createSaleDto, userId);

      const createdQueryRunner =
        mockInventoryRepository.manager.connection.createQueryRunner.mock
          .results[0].value;
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { productCode: 'PROD-001' },
      });
      expect(createdQueryRunner.query).toHaveBeenCalled();
      expect(result.message).toContain('Venta registrada exitosamente');
    });

    it('debería lanzar error si el producto no existe', async () => {
      const createSaleDto: CreateSaleDto = {
        productCode: 'INVALID',
        quantity: 5,
      };
      const userId = 1;

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.createSale(createSaleDto, userId)).rejects.toThrow(
        'Producto con código "INVALID" no encontrado',
      );
    });

    it('debería lanzar error si no hay suficiente stock', async () => {
      const createSaleDto: CreateSaleDto = {
        productCode: 'PROD-001',
        quantity: 10,
      };
      const userId = 1;

      const mockProduct = {
        id: 1,
        productId: 1,
        productCode: 'PROD-001',
        productName: 'Producto 1',
      };
      const mockInventory = {
        id: 1,
        currentStock: 5,
        product: mockProduct,
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockInventoryViewRepository.findOne.mockResolvedValue(null);

      await expect(service.createSale(createSaleDto, userId)).rejects.toThrow(
        'No hay registro de inventario para el producto con código "PROD-001"',
      );
    });
  });

  describe('getSalesByDateRange', () => {
    it('debería retornar ventas paginadas por rango de fechas', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const mockData = [[{ id: 1, productName: 'Producto 1' }], 1];

      mockHistoricalMovementsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue(mockData),
      });

      const result = await service.getSalesByDateRange(
        startDate,
        endDate,
        paginationDto,
      );

      expect(
        mockHistoricalMovementsRepository.createQueryBuilder,
      ).toHaveBeenCalledWith('historical_movements');
      expect(result.data).toEqual([{ id: 1, productName: 'Producto 1' }]);
    });
  });

  describe('getSalesStats', () => {
    it('debería retornar estadísticas de ventas', async () => {
      const result = await service.getSalesStats();

      expect(mockHistoricalMovementsRepository.count).toHaveBeenCalledWith({
        where: { movementReason: 'VENTA' },
      });
      expect(result).toHaveProperty('totalSales');
      expect(result).toHaveProperty('totalQuantitySold');
      expect(result).toHaveProperty('salesToday');
      expect(result).toHaveProperty('quantitySoldToday');
    });
  });
});
