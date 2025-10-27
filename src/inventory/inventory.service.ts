import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryView } from 'src/entities/Inventory-view.entity';
import { InventoryReportView } from 'src/entities/Inventory-report-view.entity';
import { SalesByCategoryView } from 'src/entities/Sales-by-category-view.entity';
import { IncomeByLotView } from 'src/entities/Income-by-lot-view.entity';
import { ClosureHeaderView } from 'src/entities/Closure-header-view.entity';
import { Repository } from 'typeorm';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { MonthlyClosureResponseDto } from './dto/monthly-closure-response.dto';
import {
  InventoryReportDto,
  InventoryReportSummaryDto,
} from './dto/inventory-report.dto';
import {
  SalesByCategoryProductDto,
  SalesByCategorySummaryDto,
} from './dto/sales-by-category.dto';
import {
  IncomeByLotItemDto,
  IncomeByLotSummaryDto,
} from './dto/income-by-lot.dto';
import { ClosureHeaderResponseDto } from './dto/closure-header-response.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryView)
    private readonly inventoryViewRepository: Repository<InventoryView>,
    @InjectRepository(InventoryReportView)
    private readonly inventoryReportViewRepository: Repository<InventoryReportView>,
    @InjectRepository(SalesByCategoryView)
    private readonly salesByCategoryViewRepository: Repository<SalesByCategoryView>,
    @InjectRepository(IncomeByLotView)
    private readonly incomeByLotViewRepository: Repository<IncomeByLotView>,
    @InjectRepository(ClosureHeaderView)
    private readonly closureHeaderViewRepository: Repository<ClosureHeaderView>,
  ) {}

  async getInventoryDetail(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<InventoryView>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.inventoryViewRepository.findAndCount({
      skip,
      take: limit,
      order: {
        productName: 'ASC',
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
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

  async getInventoryByCategory(
    category: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<InventoryView>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.inventoryViewRepository.findAndCount({
      where: {
        productCategory: category,
      },
      skip,
      take: limit,
      order: {
        productName: 'ASC',
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
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

  async getLowStockProducts(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<InventoryView>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.inventoryViewRepository
      .createQueryBuilder('inventory')
      .where('inventory.STOCK_ACTUAL <= inventory.STOCK_MINIMO')
      .orderBy('inventory.NOMBRE_PRODUCTO', 'ASC');

    const totalItems = await queryBuilder.getCount();
    const data = await queryBuilder.skip(skip).take(limit).getMany();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
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

  async getFilteredProducts(filters: {
    categoryName?: string;
    stockLevel?: 'critical' | 'low' | 'out';
    state?: 'active' | 'inactive';
    paginationDto: PaginationDto;
  }): Promise<PaginatedResponseDto<InventoryView>> {
    const { categoryName, stockLevel, state, paginationDto } = filters;
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.inventoryViewRepository.createQueryBuilder('inventory');

    if (categoryName) {
      queryBuilder.andWhere('inventory.CATEGORIA_PRODUCTO = :categoryName', {
        categoryName,
      });
    }

    if (stockLevel) {
      if (stockLevel === 'critical') {
        queryBuilder.andWhere(
          'inventory.STOCK_ACTUAL = inventory.STOCK_MINIMO',
        );
      } else if (stockLevel === 'low') {
        queryBuilder.andWhere(
          'inventory.STOCK_ACTUAL <= inventory.STOCK_MINIMO + 5',
        );
      } else if (stockLevel === 'out') {
        queryBuilder.andWhere('inventory.STOCK_ACTUAL = 0');
      }
    }

    if (state) {
      queryBuilder.andWhere('inventory.ESTADO_PRODUCTO = :state', {
        state: state === 'active' ? 'Activo' : 'Inactivo',
      });
    }

    queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('inventory.NOMBRE_PRODUCTO', 'ASC');

    const [data, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
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

  async updateStock(
    updateStockDto: UpdateStockDto,
  ): Promise<{ message: string }> {
    const {
      productId,
      lotId,
      quantity,
      productCode,
      userId,
      type,
      movementReason,
    } = updateStockDto;

    const connection = this.inventoryViewRepository.manager.connection;
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (type === 'ENTRADA') {
        await queryRunner.query(
          `BEGIN PKG_CENTRAL.CARGAR_INVENTARIO(:1, :2, :3, :4, :5, :6); END;`,
          [productId, lotId, quantity, productCode, userId, movementReason],
        );
      } else if (type === 'SALIDA') {
        await queryRunner.query(
          `BEGIN PKG_CENTRAL.DESCARGAR_INVENTARIO(:1, :2, :3, :4, :5, :6); END;`,
          [productId, lotId, quantity, productCode, userId, movementReason],
        );
      } else {
        throw new Error('Invalid stock update type. Use ENTRADA or SALIDA.');
      }

      await queryRunner.commitTransaction();
      const messageType = type === 'ENTRADA' ? 'entrada' : 'salida';
      return {
        message: `Stock actualizado exitosamente con ${messageType} de ${quantity} unidades. Razón: ${movementReason}`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async generateMonthlyClosure(
    userEmail: string,
  ): Promise<MonthlyClosureResponseDto> {
    const connection = this.inventoryViewRepository.manager.connection;
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Set timezone for accurate date handling
      await queryRunner.query(`ALTER SESSION SET TIME_ZONE = 'America/Bogota'`);

      // Call the stored procedure
      await queryRunner.query(`BEGIN GENERAR_CIERRE_MENSUAL(:1); END;`, [
        userEmail,
      ]);

      await queryRunner.commitTransaction();

      // Get current month and year for response
      const now = new Date();
      const month = now.getMonth() + 1; // JavaScript months are 0-indexed
      const year = now.getFullYear();

      return {
        message: `Cierre mensual generado exitosamente para ${this.getMonthName(month)} ${year}`,
        headerId: 0, // This would need to be retrieved from the procedure if needed
        month,
        year,
        createdAt: now,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Handle specific Oracle error for duplicate closure
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message;
        if (errorMessage.includes('-20001')) {
          throw new Error('Ya existe un cierre para este mes.');
        }
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllClosures(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<ClosureHeaderResponseDto>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, totalItems] =
      await this.closureHeaderViewRepository.findAndCount({
        skip,
        take: limit,
        order: {
          closureDate: 'DESC',
        },
      });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
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

  private getMonthName(month: number): string {
    const months = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    return months[month - 1];
  }

  /**
   * Generar reporte general de inventario
   * Historia de Usuario: GES-166
   */
  async generateInventoryReport(): Promise<InventoryReportSummaryDto> {
    // Obtener todos los productos del reporte
    const products = await this.inventoryReportViewRepository.find({
      order: {
        categoryName: 'ASC',
        productName: 'ASC',
      },
    });

    // Calcular resumen
    const totalProducts = products.length;
    const totalUnits = products.reduce(
      (sum, p) => sum + Number(p.availableUnits),
      0,
    );
    const totalInventoryValue = products.reduce(
      (sum, p) => sum + Number(p.totalValue),
      0,
    );
    const lowStockProducts = products.filter(
      (p) => Number(p.availableUnits) <= Number(p.minimumStock),
    ).length;

    // Mapear a DTOs
    const productsDto: InventoryReportDto[] = products.map((p) => ({
      productId: p.productId,
      productCode: p.productCode,
      productName: p.productName,
      productDescription: p.productDescription,
      categoryName: p.categoryName,
      productState: p.productState,
      measurementName: p.measurementName,
      availableUnits: Number(p.availableUnits),
      minimumStock: Number(p.minimumStock),
      unitPrice: Number(p.unitPrice),
      totalValue: Number(p.totalValue),
      lotCode: p.lotCode,
      lastUpdate: p.lastUpdate,
    }));

    return {
      totalProducts,
      totalUnits,
      totalInventoryValue,
      lowStockProducts,
      products: productsDto,
    };
  }

  /**
   * Generar reporte de productos vendidos por categoría
   * Historia de Usuario: GES-167
   */
  async generateSalesByCategoryReport(): Promise<SalesByCategorySummaryDto> {
    const products = await this.salesByCategoryViewRepository.find({
      order: {
        categoryName: 'ASC',
        unitsSold: 'DESC',
      },
    });

    // Calcular resumen
    const categories = new Set(products.map((p) => p.categoryName));
    const totalCategories = categories.size;
    const totalProducts = products.length;
    const totalUnitsSold = products.reduce(
      (sum, p) => sum + Number(p.unitsSold),
      0,
    );
    const totalSalesValue = products.reduce(
      (sum, p) => sum + Number(p.totalSalesValue),
      0,
    );

    // Encontrar categoría con más ventas
    const categorySales = new Map<string, number>();
    products.forEach((p) => {
      const current = categorySales.get(p.categoryName) || 0;
      categorySales.set(p.categoryName, current + Number(p.totalSalesValue));
    });

    let topCategory = '';
    let maxSales = 0;
    categorySales.forEach((sales, category) => {
      if (sales > maxSales) {
        maxSales = sales;
        topCategory = category;
      }
    });

    // Mapear a DTOs
    const productsDto: SalesByCategoryProductDto[] = products.map((p) => ({
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      productId: p.productId,
      productCode: p.productCode,
      productName: p.productName,
      currentStock: Number(p.currentStock),
      minimumStock: Number(p.minimumStock),
      unitPrice: Number(p.unitPrice),
      unitsSold: Number(p.unitsSold),
      totalSalesValue: Number(p.totalSalesValue),
      lastUpdate: p.lastUpdate,
    }));

    return {
      totalCategories,
      totalProducts,
      totalUnitsSold,
      totalSalesValue,
      topCategory,
      products: productsDto,
    };
  }

  /**
   * Generar reporte de ingresos por lote
   * Historia de Usuario: GES-168
   */
  async generateIncomeByLotReport(): Promise<IncomeByLotSummaryDto> {
    const items = await this.incomeByLotViewRepository.find({
      order: {
        entryDate: 'DESC',
        categoryName: 'ASC',
      },
    });

    // Calcular resumen
    const lots = new Set(items.map((i) => i.lotId));
    const totalLots = lots.size;
    const totalProducts = items.length;
    const totalUnits = items.reduce(
      (sum, i) => sum + Number(i.currentUnits),
      0,
    );
    const totalValue = items.reduce((sum, i) => sum + Number(i.totalValue), 0);
    const mostRecentEntry = items.length > 0 ? items[0].entryDate : new Date();

    // Mapear a DTOs
    const itemsDto: IncomeByLotItemDto[] = items.map((i) => ({
      lotId: i.lotId,
      lotCode: i.lotCode,
      lotDescription: i.lotDescription,
      entryDate: i.entryDate,
      productId: i.productId,
      productCode: i.productCode,
      productName: i.productName,
      categoryName: i.categoryName,
      measurementName: i.measurementName,
      currentUnits: Number(i.currentUnits),
      unitPrice: Number(i.unitPrice),
      totalValue: Number(i.totalValue),
      productState: i.productState,
      lastUpdate: i.lastUpdate,
    }));

    return {
      totalLots,
      totalProducts,
      totalUnits,
      totalValue,
      mostRecentEntry,
      items: itemsDto,
    };
  }
}
