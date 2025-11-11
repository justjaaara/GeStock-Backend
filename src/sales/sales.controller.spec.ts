import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaginationDto } from '../inventory/dto/pagination.dto';
import { FilterSalesByDateRangeDto } from './dto/filter-sales-by-date-range.dto';

describe('SalesController', () => {
  let controller: SalesController;
  let service: SalesService;

  const mockSalesService = {
    createSale: jest.fn(),
    getSalesByDateRange: jest.fn(),
    getSalesStats: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<SalesController>(SalesController);
    service = module.get<SalesService>(SalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSale', () => {
    it('debería crear una nueva venta', async () => {
      const createSaleDto: CreateSaleDto = {
        productCode: 'PROD-001',
        quantity: 5,
      };
      const mockRequest = { user: { id: 1 } };
      const mockResponse = {
        message:
          'Venta registrada exitosamente. 5 unidades del producto "Producto 1" han sido vendidas.',
      };

      mockSalesService.createSale.mockResolvedValue(mockResponse);

      const result = await controller.createSale(createSaleDto, mockRequest);

      expect(mockSalesService.createSale).toHaveBeenCalledWith(
        createSaleDto,
        1,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSalesByDateRange', () => {
    it('debería retornar ventas filtradas por rango de fechas', async () => {
      const filterDto: FilterSalesByDateRangeDto = {
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

      mockSalesService.getSalesByDateRange.mockResolvedValue(mockResponse);

      const result = await controller.getSalesByDateRange(
        filterDto,
        paginationDto,
      );

      expect(mockSalesService.getSalesByDateRange).toHaveBeenCalledWith(
        new Date(filterDto.startDate),
        new Date(filterDto.endDate),
        paginationDto,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSalesStats', () => {
    it('debería retornar estadísticas de ventas', async () => {
      const mockStats = {
        totalSales: 100,
        totalRevenue: 10000,
        topProduct: 'Producto 1',
        salesByMonth: [],
      };

      mockSalesService.getSalesStats.mockResolvedValue(mockStats);

      const result = await controller.getSalesStats();

      expect(mockSalesService.getSalesStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
});
