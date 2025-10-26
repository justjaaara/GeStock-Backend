import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../entities/Product.entity';
import { ProductCategory } from '../entities/Product-category.entity';
import { ProductState } from '../entities/Product-state.entity';
import { MeasurementType } from '../entities/Measurement-type.entity';
import { Inventory } from '../entities/Inventory.entity';
import { Batch } from '../entities/Batches.entity';
import { InventoryView } from '../entities/Inventory-view.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  ProductStateResponseDto,
  MeasurementTypeResponseDto,
} from './dto/product-state-response.dto';
import { ProductForSaleDto } from './dto/product-for-sale.dto';
import {
  PaginationDto,
  PaginatedResponseDto,
} from '../inventory/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductState)
    private readonly stateRepository: Repository<ProductState>,
    @InjectRepository(MeasurementType)
    private readonly measurementRepository: Repository<MeasurementType>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    @InjectRepository(InventoryView)
    private readonly inventoryViewRepository: Repository<InventoryView>,
    private readonly dataSource: DataSource,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar existencias de entidades relacionadas
      const category = await this.validateCategory(createProductDto.categoryId);
      await this.validateMeasurement(createProductDto.measurementId);
      const activeState = await this.getActiveState();

      if (createProductDto.lotId) {
        await this.validateBatch(createProductDto.lotId);
      }

      const productCode = await this.generateProductCode(
        createProductDto.categoryId,
        category.categoryName,
      );

      console.log(`Código generado para producto: ${productCode}`);

      const product = this.productRepository.create({
        productName: createProductDto.productName,
        productDescription: createProductDto.productDescription,
        productCode: productCode,
        unitPrice: createProductDto.unitPrice,
        categoryId: createProductDto.categoryId,
        measurementId: createProductDto.measurementId,
        stateId: activeState.stateId, // Estado activo por defecto (ID = 1)
      });

      const savedProduct = await queryRunner.manager.save(Product, product);

      // Como el producto tiene estado activo tiene que tener un stock inicial así sea 0
      const inventory = this.inventoryRepository.create({
        productId: savedProduct.productId,
        actualStock: createProductDto.actualStock,
        minimumStock: createProductDto.minimumStock || 0,
        lotId: createProductDto.lotId,
      });

      await queryRunner.manager.save(Inventory, inventory);

      await queryRunner.commitTransaction();

      console.log(
        `Producto creado exitosamente: ${savedProduct.productName} (${productCode})`,
      );

      return await this.getProductWithDetails(savedProduct.productId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al crear producto:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Genera un código único para el producto basado en la categoría
   * Formato: {CATEGORIA}-{CONSECUTIVO}
   * Ejemplo: BEBIDAS-001, SNACKS-025
   */
  private async generateProductCode(
    categoryId: number,
    categoryName: string,
  ): Promise<string> {
    // Normalizar el nombre de la categoría (remover espacios, acentos, convertir a mayúsculas)
    const normalizedCategory = this.normalizeString(categoryName);

    // Obtener el máximo consecutivo de productos ACTIVOS en esta categoría
    const maxActiveProduct = await this.productRepository
      .createQueryBuilder('product')
      .where('product.CATEGORY_ID = :categoryId', { categoryId })
      .andWhere('product.STATE_ID = :activeStateId', { activeStateId: 1 })
      .orderBy('product.PRODUCT_ID', 'DESC')
      .getOne();

    let nextConsecutive = 1;

    if (maxActiveProduct && maxActiveProduct.productCode) {
      // Intentar extraer el número del código existente
      const codeMatch = maxActiveProduct.productCode.match(/-(\d+)$/);
      if (codeMatch) {
        nextConsecutive = parseInt(codeMatch[1], 10) + 1;
      } else {
        // Si no hay match, contar productos ACTIVOS de la categoría
        const count = await this.productRepository.count({
          where: { categoryId, stateId: 1 },
        });
        nextConsecutive = count + 1;
      }
    }

    // Verificar si existe un producto inactivo con el código que vamos a generar
    const proposedCode = `${normalizedCategory}-${nextConsecutive.toString().padStart(3, '0')}`;
    const inactiveProductWithCode = await this.productRepository.findOne({
      where: {
        productCode: proposedCode,
        stateId: 2, // Estado inactivo
      },
    });

    // Si existe un producto inactivo con ese código, podemos reutilizarlo
    if (inactiveProductWithCode) {
      return proposedCode;
    }

    // Formatear el consecutivo con ceros a la izquierda (3 dígitos)
    const formattedConsecutive = nextConsecutive.toString().padStart(3, '0');

    return `${normalizedCategory}-${formattedConsecutive}`;
  }

  /**
   * Normaliza un string removiendo acentos, espacios y convirtiéndolo a mayúsculas
   */
  private normalizeString(str: string): string {
    return str
      .normalize('NFD') // Descomponer caracteres con acentos
      .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas
      .replace(/\s+/g, '_') // Reemplazar espacios por guiones bajos
      .toUpperCase(); // Convertir a mayúsculas
  }

  /**
   * Obtiene el estado "Activo" (ID = 1)
   */
  private async getActiveState(): Promise<ProductState> {
    const activeState = await this.stateRepository.findOne({
      where: { stateId: 1 },
    });

    if (!activeState) {
      throw new NotFoundException(
        'Estado "Activo" no encontrado. Por favor, verifica la configuración de estados en la base de datos.',
      );
    }

    return activeState;
  }

  /**
   * Valida que la categoría exista
   */
  private async validateCategory(categoryId: number): Promise<ProductCategory> {
    const category = await this.categoryRepository.findOne({
      where: { categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${categoryId} no encontrada`,
      );
    }

    return category;
  }

  /**
   * Valida que el tipo de medida exista
   */
  private async validateMeasurement(measurementId: number): Promise<void> {
    const measurement = await this.measurementRepository.findOne({
      where: { measurementId },
    });

    if (!measurement) {
      throw new NotFoundException(
        `Tipo de medida con ID ${measurementId} no encontrado`,
      );
    }
  }

  /**
   * Valida que el lote exista
   */
  private async validateBatch(lotId: number): Promise<void> {
    const batch = await this.batchRepository.findOne({
      where: { lotId },
    });

    if (!batch) {
      throw new NotFoundException(`Lote con ID ${lotId} no encontrado`);
    }
  }

  /**
   * Obtiene un producto con todos sus detalles y relaciones
   */
  private async getProductWithDetails(
    productId: number,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { productId },
      relations: ['category', 'state', 'measurement', 'inventories'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${productId} no encontrado`);
    }

    const inventory = product.inventories[0];

    return {
      productId: product.productId,
      productName: product.productName,
      productDescription: product.productDescription,
      productCode: product.productCode,
      unitPrice: Number(product.unitPrice),
      categoryName: product.category?.categoryName,
      measurementName: product.measurement?.measurementName,
      stateName: product.state?.stateName,
      actualStock: inventory?.actualStock || 0,
      minimumStock: inventory?.minimumStock || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Obtiene todas las categorías de productos
   */
  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      order: { categoryName: 'ASC' },
    });

    return categories.map((category) => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
    }));
  }

  /**
   * Obtiene el estado de un producto específico por su código
   */
  async getProductState(productCode: string): Promise<ProductStateResponseDto> {
    const product = await this.productRepository.findOne({
      where: { productCode },
      relations: ['state'],
    });

    if (!product) {
      throw new NotFoundException(
        `Producto con código ${productCode} no encontrado`,
      );
    }

    if (!product.state) {
      throw new NotFoundException(
        `El producto con código ${productCode} no tiene un estado asignado`,
      );
    }

    return {
      stateId: product.state.stateId,
      stateName: product.state.stateName,
    };
  }

  /**
   * Obtiene todos los tipos de medidas
   */
  async getAllMeasurementTypes(): Promise<MeasurementTypeResponseDto[]> {
    const measurements = await this.measurementRepository.find({
      order: { measurementName: 'ASC' },
    });

    return measurements.map((measurement) => ({
      measurementId: measurement.measurementId,
      measurementName: measurement.measurementName,
    }));
  }

  /**
   * Actualiza un producto por su código
   */
  async updateProduct(
    productCode: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    console.log(
      '🚀 ~ ProductsService ~ updateProduct ~ updateProductDto:',
      updateProductDto,
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar el producto por código
      const product = await this.productRepository.findOne({
        where: { productCode },
      });

      if (!product) {
        throw new NotFoundException(
          `Producto con código ${productCode} no encontrado`,
        );
      }

      // Validar que la nueva categoría exista
      await this.validateCategory(updateProductDto.categoryId);

      // Actualizar los campos permitidos
      const updatedProduct = await queryRunner.manager.save(Product, {
        ...product,
        productName: updateProductDto.productName,
        productDescription: updateProductDto.productDescription,
        unitPrice: updateProductDto.unitPrice,
        categoryId: updateProductDto.categoryId,
      });

      await queryRunner.commitTransaction();

      console.log(
        `✅ Producto actualizado exitosamente: ${updatedProduct.productName} (${productCode})`,
      );

      // Retornar el producto actualizado con sus relaciones
      return await this.getProductWithDetails(updatedProduct.productId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error al actualizar producto:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Elimina un producto por su código (soft delete - cambio de estado a inactivo)
   */
  async deleteProduct(productCode: string): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar el producto por código
      const product = await this.productRepository.findOne({
        where: { productCode },
        relations: ['state'],
      });

      if (!product) {
        throw new NotFoundException(
          `Producto con código ${productCode} no encontrado`,
        );
      }

      // Verificar si el producto ya está inactivo
      if (product.stateId === 2) {
        throw new BadRequestException(
          `El producto ${productCode} ya está inactivo`,
        );
      }

      // Validar que exista el estado "Inactivo" (ID = 2)
      const inactiveState = await this.stateRepository.findOne({
        where: { stateId: 2 },
      });

      if (!inactiveState) {
        throw new BadRequestException(
          'Estado "Inactivo" no encontrado en el sistema',
        );
      }

      // Cambiar el estado del producto a inactivo (soft delete)
      await queryRunner.manager.update(
        Product,
        { productId: product.productId },
        {
          stateId: 2, // Estado inactivo
          updatedAt: new Date(),
        },
      );

      await queryRunner.commitTransaction();

      console.log(
        `✅ Producto marcado como inactivo exitosamente: ${product.productName} (${productCode})`,
      );

      return {
        message: `Producto ${productCode} marcado como inactivo exitosamente. El código puede ser reutilizado en el futuro.`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error al desactivar producto:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene un producto específico por su código
   */
  async getProductByCode(productCode: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { productCode },
      relations: ['category', 'state', 'measurement', 'inventories'],
    });

    if (!product) {
      throw new NotFoundException(
        `Producto con código ${productCode} no encontrado`,
      );
    }

    const inventory = product.inventories[0];

    return {
      productId: product.productId,
      productName: product.productName,
      productDescription: product.productDescription,
      productCode: product.productCode,
      unitPrice: Number(product.unitPrice),
      categoryName: product.category?.categoryName,
      measurementName: product.measurement?.measurementName,
      stateName: product.state?.stateName,
      actualStock: inventory?.actualStock || 0,
      minimumStock: inventory?.minimumStock || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async getProductsForSale(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<ProductForSaleDto>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.inventoryViewRepository.findAndCount({
      where: {
        productState: 'Activo',
      },
      skip,
      take: limit,
      order: {
        productName: 'ASC',
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: data as ProductForSaleDto[],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
