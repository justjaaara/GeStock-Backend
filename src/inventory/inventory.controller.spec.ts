import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    getInventory: jest.fn(),
    getInventoryDetail: jest.fn(),
    updateStock: jest.fn(),
    getFilteredProducts: jest.fn(),
    getInventoryReport: jest.fn(),
    getSalesByCategory: jest.fn(),
    getIncomeByLot: jest.fn(),
    generateMonthlyClosure: jest.fn(),
    getClosureHeader: jest.fn(),
    getInventoryClosureDetails: jest.fn(),
    getMovementStats: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInventory', () => {
    it('debería retornar inventario paginado', async () => {
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

      mockInventoryService.getInventoryDetail.mockResolvedValue(mockResponse);

      const result = await controller.getInventory(paginationDto);

      expect(mockInventoryService.getInventoryDetail).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateStock', () => {
    it('debería actualizar stock del producto', async () => {
      const updateStockDto: UpdateStockDto = {
        productCode: 'PROD-001',
        newStock: 100,
      };
      const mockResponse = { message: 'Stock actualizado exitosamente' };

      mockInventoryService.updateStock.mockResolvedValue(mockResponse);

      const result = await controller.updateStock(updateStockDto);

      expect(mockInventoryService.updateStock).toHaveBeenCalledWith(
        updateStockDto,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFilteredProducts', () => {
    it('debería retornar productos filtrados', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 20 };
      const categoryName = 'Bebidas';
      const stockLevel = 'critical';
      const state = 'active';
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
      mockInventoryService.getFilteredProducts.mockResolvedValue(mockResponse);

      const result = await controller.getFilteredProducts(
        paginationDto,
        categoryName,
        stockLevel,
        state,
      );

      expect(mockInventoryService.getFilteredProducts).toHaveBeenCalledWith({
        categoryName,
        stockLevel,
        state,
        paginationDto,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateMonthlyClosure', () => {
    it('debería generar cierre mensual', async () => {
      const mockRequest = { user: { email: 'test@example.com' } };
      const mockResponse = { message: 'Cierre mensual generado exitosamente' };

      mockInventoryService.generateMonthlyClosure.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.generateMonthlyClosure(mockRequest);

      expect(mockInventoryService.generateMonthlyClosure).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
