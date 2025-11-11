import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from '../entities/Product.entity';
import { ProductCategory } from '../entities/Product-category.entity';
import { ProductState } from '../entities/Product-state.entity';
import { MeasurementType } from '../entities/Measurement-type.entity';
import { Inventory } from '../entities/Inventory.entity';
import { Batch } from '../entities/Batches.entity';
import { InventoryView } from '../entities/Inventory-view.entity';
import { DataSource } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductRepository: any;
  let mockCategoryRepository: any;
  let mockStateRepository: any;
  let mockMeasurementRepository: any;
  let mockInventoryRepository: any;
  let mockBatchRepository: any;
  let mockInventoryViewRepository: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      query: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ productId: 1 }),
      }),
    };
    mockCategoryRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    mockStateRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    mockMeasurementRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    mockInventoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    mockBatchRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    mockInventoryViewRepository = {
      find: jest.fn(),
      findAndCount: jest.fn(),
    };
    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest.fn(),
          create: jest.fn(),
          findOne: jest.fn(),
          update: jest.fn(),
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(ProductState),
          useValue: mockStateRepository,
        },
        {
          provide: getRepositoryToken(MeasurementType),
          useValue: mockMeasurementRepository,
        },
        {
          provide: getRepositoryToken(Inventory),
          useValue: mockInventoryRepository,
        },
        {
          provide: getRepositoryToken(Batch),
          useValue: mockBatchRepository,
        },
        {
          provide: getRepositoryToken(InventoryView),
          useValue: mockInventoryViewRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('debería crear un producto con inventario inicial', async () => {
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

      const mockCategory = { id: 1, categoryName: 'Bebidas' };
      const mockProduct = {
        id: 1,
        productCode: 'BEB-001',
        productName: 'Producto Nuevo',
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockMeasurementRepository.findOne.mockResolvedValue({ measurementId: 1 });
      mockStateRepository.findOne.mockResolvedValue({ stateId: 1 });
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue({
        ...mockProduct,
        productId: 1,
      });
      // Mock the queryRunner methods
      const mockQueryRunner = mockDataSource.createQueryRunner();
      mockQueryRunner.manager.save.mockResolvedValue(mockProduct);
      // Mock getProductWithDetails
      mockProductRepository.findOne.mockResolvedValue({
        ...mockProduct,
        productId: 1,
        inventories: [{ currentStock: 50 }],
      });

      const result = await service.createProduct(createProductDto);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { categoryId: 1 },
      });
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('productCode');
    });
  });

  describe('getAllCategories', () => {
    it('debería retornar todas las categorías', async () => {
      const mockCategories = [{ categoryId: 1, categoryName: 'Bebidas' }];

      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.getAllCategories();

      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        order: { categoryName: 'ASC' },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getProductState', () => {
    it('debería retornar el estado de un producto', async () => {
      const productCode = 'PROD-001';
      const mockState = { stateName: 'Activo', stateId: 1 };

      mockProductRepository.findOne.mockResolvedValue({
        productCode,
        state: mockState,
      });

      const result = await service.getProductState(productCode);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { productCode },
        relations: ['state'],
      });
      expect(result).toEqual(mockState);
    });
  });

  describe('getAllMeasurementTypes', () => {
    it('debería retornar todos los tipos de medición', async () => {
      const mockTypes = [{ measurementId: 1, measurementName: 'Unidad' }];

      mockMeasurementRepository.find.mockResolvedValue(mockTypes);

      const result = await service.getAllMeasurementTypes();

      expect(mockMeasurementRepository.find).toHaveBeenCalledWith({
        order: { measurementName: 'ASC' },
      });
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
      const mockProduct = {
        productId: 1,
        productName: 'Producto Viejo',
        categoryId: 1,
        inventories: [{ currentStock: 10 }],
        category: { categoryName: 'Bebidas' },
        state: { stateName: 'Activo' },
        measurementType: { measurementName: 'Unidad' },
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockCategoryRepository.findOne.mockResolvedValue({ categoryId: 1 });
      // Mock the queryRunner for update
      const mockQueryRunner = mockDataSource.createQueryRunner();
      mockQueryRunner.manager.save.mockResolvedValue({
        ...mockProduct,
        ...updateProductDto,
      });

      const result = await service.updateProduct(productCode, updateProductDto);

      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(result.productName).toBe('Producto Viejo');
    });
  });

  describe('deleteProduct', () => {
    it('debería eliminar un producto', async () => {
      const productCode = 'PROD-001';
      const mockProduct = { productId: 1, productName: 'Producto 1' };
      const mockResult = { affected: 1 };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockStateRepository.findOne.mockResolvedValue({
        stateId: 2,
        stateName: 'Inactivo',
      });
      // Mock the queryRunner for delete
      const mockQueryRunner = mockDataSource.createQueryRunner();
      mockQueryRunner.manager.update.mockResolvedValue(mockResult);

      const result = await service.deleteProduct(productCode);

      expect(mockQueryRunner.manager.update).toHaveBeenCalled();
      expect(result.message).toContain('marcado como inactivo');
    });
  });

  describe('getProductByCode', () => {
    it('debería retornar un producto por código', async () => {
      const productCode = 'PROD-001';
      const mockProduct = {
        productId: 1,
        productName: 'Producto 1',
        inventories: [{ currentStock: 10 }],
        category: { categoryName: 'Bebidas' },
        state: { stateName: 'Activo' },
        measurementType: { measurementName: 'Unidad' },
      };

      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.getProductByCode(productCode);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { productCode, stateId: 1 },
        relations: ['category', 'state', 'measurement', 'inventories'],
      });
      expect(result).toHaveProperty('productId');
    });
  });

  describe('getProductsForSale', () => {
    it('debería retornar productos disponibles para venta', async () => {
      const paginationDto = { page: 1, limit: 20 };
      const mockProducts = [
        { id: 1, productName: 'Producto 1', currentStock: 10 },
      ];
      const mockData = [mockProducts, 1];

      mockInventoryViewRepository.findAndCount.mockResolvedValue(mockData);

      const result = await service.getProductsForSale(paginationDto);

      expect(mockInventoryViewRepository.findAndCount).toHaveBeenCalledWith({
        where: { productState: 'Activo' },
        order: { productName: 'ASC' },
        skip: 0,
        take: 20,
      });
      expect(result.data).toEqual(mockProducts);
    });
  });

  describe('getProductStats', () => {
    it('debería retornar estadísticas de productos', async () => {
      mockStateRepository.findOne
        .mockResolvedValueOnce({ stateId: 1, stateName: 'Activo' })
        .mockResolvedValueOnce({ stateId: 2, stateName: 'Inactivo' });
      mockProductRepository.count.mockResolvedValueOnce(100);
      mockProductRepository.count.mockResolvedValueOnce(95);
      mockProductRepository.count.mockResolvedValueOnce(5);

      const result = await service.getProductStats();

      expect(mockProductRepository.count).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('totalProducts', 100);
      expect(result).toHaveProperty('activeProducts', 95);
      expect(result).toHaveProperty('inactiveProducts', 5);
    });
  });
});
