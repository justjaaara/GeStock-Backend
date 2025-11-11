import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryView } from '../entities/Inventory-view.entity';
import { InventoryReportView } from '../entities/Inventory-report-view.entity';
import { SalesByCategoryView } from '../entities/Sales-by-category-view.entity';
import { IncomeByLotView } from '../entities/Income-by-lot-view.entity';
import { ClosureHeaderView } from '../entities/Closure-header-view.entity';
import { InventoryClosureDetailsView } from '../entities/Inventory-closure-details-view.entity';
import { Inventory } from '../entities/Inventory.entity';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

describe('InventoryService', () => {
  let service: InventoryService;
  let mockInventoryViewRepository: any;
  let mockInventoryReportViewRepository: any;
  let mockSalesByCategoryViewRepository: any;
  let mockIncomeByLotViewRepository: any;
  let mockClosureHeaderViewRepository: any;
  let mockInventoryClosureDetailsViewRepository: any;
  let mockInventoryRepository: any;

  beforeEach(async () => {
    mockInventoryViewRepository = {
      findAndCount: jest.fn(),
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
    };
    mockInventoryReportViewRepository = {
      findAndCount: jest.fn(),
    };
    mockSalesByCategoryViewRepository = {
      findAndCount: jest.fn(),
    };
    mockIncomeByLotViewRepository = {
      findAndCount: jest.fn(),
    };
    mockClosureHeaderViewRepository = {
      findAndCount: jest.fn(),
    };
    mockInventoryClosureDetailsViewRepository = {
      findAndCount: jest.fn(),
    };
    mockInventoryRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(InventoryView),
          useValue: mockInventoryViewRepository,
        },
        {
          provide: getRepositoryToken(InventoryReportView),
          useValue: mockInventoryReportViewRepository,
        },
        {
          provide: getRepositoryToken(SalesByCategoryView),
          useValue: mockSalesByCategoryViewRepository,
        },
        {
          provide: getRepositoryToken(IncomeByLotView),
          useValue: mockIncomeByLotViewRepository,
        },
        {
          provide: getRepositoryToken(ClosureHeaderView),
          useValue: mockClosureHeaderViewRepository,
        },
        {
          provide: getRepositoryToken(InventoryClosureDetailsView),
          useValue: mockInventoryClosureDetailsViewRepository,
        },
        {
          provide: getRepositoryToken(Inventory),
          useValue: mockInventoryRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInventoryDetail', () => {
    it('debería retornar inventario detallado paginado', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const mockData = [[{ productName: 'Producto 1' }], 1];

      mockInventoryViewRepository.findAndCount.mockResolvedValue(mockData);

      const result = await service.getInventoryDetail(paginationDto);

      expect(mockInventoryViewRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        order: { productName: 'ASC' },
      });
      expect(result.data).toEqual([{ productName: 'Producto 1' }]);
      expect(result.pagination.totalItems).toBe(1);
    });
  });

  describe('updateStock', () => {
    it('debería actualizar el stock de un producto', async () => {
      // The real implementation uses a queryRunner and stored procedures
      // so we assert that the queryRunner.query was invoked with the carga procedure
      const updateStockDto: UpdateStockDto = {
        productId: 10,
        lotId: 5,
        quantity: 12,
        productCode: 'PROD-001',
        userId: 1,
        type: 'ENTRADA',
        movementReason: 'Test entrada',
      } as any;

      const result = await service.updateStock(updateStockDto);

      const createdQueryRunner =
        mockInventoryViewRepository.manager.connection.createQueryRunner.mock
          .results[0].value;
      expect(createdQueryRunner.query).toHaveBeenCalled();
      // check returned message mentions entrada and the quantity
      expect(result.message).toContain('entrada');
      expect(result.message).toContain(String(updateStockDto.quantity));
    });
  });
});
