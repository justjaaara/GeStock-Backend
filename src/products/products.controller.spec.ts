import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../inventory/dto/pagination.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    createProduct: jest.fn(),
    getAllCategories: jest.fn(),
    getProductState: jest.fn(),
    getAllMeasurementTypes: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    getProductByCode: jest.fn(),
    getProductsForSale: jest.fn(),
    getProductStats: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('debería crear un nuevo producto', async () => {
      const createProductDto: CreateProductDto = {
        productName: 'Producto Nuevo',
        productDescription: 'Descripción',
        unitPrice: 100,
        minimumStock: 10,
        categoryId: 1,
        measurementId: 1,
        stateId: 1,
        initialStock: 50,
      };

      const mockResponse = {
        id: 1,
        productCode: 'CAT-001',
        productName: 'Producto Nuevo',
      };

      mockProductsService.createProduct.mockResolvedValue(mockResponse);

      const result = await controller.createProduct(createProductDto);

      expect(mockProductsService.createProduct).toHaveBeenCalledWith(
        createProductDto,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAllCategories', () => {
    it('debería retornar todas las categorías', async () => {
      const mockCategories = [{ id: 1, categoryName: 'Bebidas' }];

      mockProductsService.getAllCategories.mockResolvedValue(mockCategories);

      const result = await controller.getAllCategories();

      expect(mockProductsService.getAllCategories).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getProductsForSale', () => {
    it('debería retornar productos para venta paginados', async () => {
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

      mockProductsService.getProductsForSale.mockResolvedValue(mockResponse);

      const result = await controller.getProductsForSale(paginationDto);

      expect(mockProductsService.getProductsForSale).toHaveBeenCalledWith(
        paginationDto,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProductStats', () => {
    it('debería retornar estadísticas de productos', async () => {
      const mockStats = {
        totalProducts: 100,
        activeProducts: 95,
        inactiveProducts: 5,
      };

      mockProductsService.getProductStats.mockResolvedValue(mockStats);

      const result = await controller.getProductStats();

      expect(mockProductsService.getProductStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('getProductState', () => {
    it('debería retornar el estado de un producto', async () => {
      const productCode = 'PROD-001';
      const mockState = { stateName: 'Activo', stateId: 1 };

      mockProductsService.getProductState.mockResolvedValue(mockState);

      const result = await controller.getProductState(productCode);

      expect(mockProductsService.getProductState).toHaveBeenCalledWith(
        productCode,
      );
      expect(result).toEqual(mockState);
    });
  });

  describe('getProductByCode', () => {
    it('debería retornar un producto por código', async () => {
      const productCode = 'PROD-001';
      const mockProduct = {
        productId: 1,
        productCode,
        productName: 'Producto 1',
      };

      mockProductsService.getProductByCode.mockResolvedValue(mockProduct);

      const result = await controller.getProductByCode(productCode);

      expect(mockProductsService.getProductByCode).toHaveBeenCalledWith(
        productCode,
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getAllMeasurementTypes', () => {
    it('debería retornar todos los tipos de medición', async () => {
      const mockTypes = [{ id: 1, measurementName: 'Unidad' }];

      mockProductsService.getAllMeasurementTypes.mockResolvedValue(mockTypes);

      const result = await controller.getAllMeasurementTypes();

      expect(mockProductsService.getAllMeasurementTypes).toHaveBeenCalled();
      expect(result).toEqual(mockTypes);
    });
  });

  describe('updateProduct', () => {
    it('debería actualizar un producto', async () => {
      const productCode = 'PROD-001';
      const updateProductDto: UpdateProductDto = {
        productName: 'Producto Actualizado',
        unitPrice: 150,
      };

      const mockResponse = {
        productId: 1,
        productCode: 'PROD-001',
        productName: 'Producto Actualizado',
      };

      mockProductsService.updateProduct.mockResolvedValue(mockResponse);

      const result = await controller.updateProduct(
        productCode,
        updateProductDto,
      );

      expect(mockProductsService.updateProduct).toHaveBeenCalledWith(
        productCode,
        updateProductDto,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteProduct', () => {
    it('debería eliminar un producto', async () => {
      const productCode = 'PROD-001';
      const mockResponse = { message: 'Producto eliminado exitosamente' };

      mockProductsService.deleteProduct.mockResolvedValue(mockResponse);

      const result = await controller.deleteProduct(productCode);

      expect(mockProductsService.deleteProduct).toHaveBeenCalledWith(
        productCode,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProductsForSale', () => {
    it('debería retornar productos para venta', async () => {
      const mockProducts = [
        { id: 1, productName: 'Producto 1', currentStock: 10 },
      ];

      mockProductsService.getProductsForSale.mockResolvedValue(mockProducts);

      const result = await controller.getProductsForSale();

      expect(mockProductsService.getProductsForSale).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });
});
