import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/entities/Product.entity';
import { Inventory } from 'src/entities/Inventory.entity';
import { InventoryView } from 'src/entities/Inventory-view.entity';
import { HistoricalMovements } from 'src/entities/Historical-movements.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import {
  PaginationDto,
  PaginatedResponseDto,
} from '../inventory/dto/pagination.dto';
import { SalesStatsDto } from './dto/sales-stats.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryView)
    private readonly inventoryViewRepository: Repository<InventoryView>,
    @InjectRepository(HistoricalMovements)
    private readonly historicalMovementsRepository: Repository<HistoricalMovements>,
  ) {}

  async createSale(
    createSaleDto: CreateSaleDto,
    userId: number,
  ): Promise<{ message: string }> {
    const { productCode, quantity } = createSaleDto;

    // Buscar producto por código
    const product = await this.productRepository.findOne({
      where: { productCode },
    });

    if (!product) {
      throw new NotFoundException(
        `Producto con código "${productCode}" no encontrado`,
      );
    }

    // Verificar stock disponible
    const inventory = await this.inventoryViewRepository.findOne({
      where: { productCode },
    });

    if (!inventory) {
      throw new NotFoundException(
        `No hay registro de inventario para el producto con código "${productCode}"`,
      );
    }

    if (inventory.currentStock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Stock disponible: ${inventory.currentStock}, Cantidad solicitada: ${quantity}`,
      );
    }

    // Obtener el lote más reciente del producto
    const lot = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.productId = :productId', {
        productId: product.productId,
      })
      .orderBy('inventory.createdAt', 'DESC')
      .getOne();

    if (!lot) {
      throw new NotFoundException(
        `No hay lotes registrados para el producto con código "${productCode}"`,
      );
    }

    // Ejecutar procedimiento DESCARGAR_INVENTARIO
    const connection = this.inventoryRepository.manager.connection;
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Establecer la zona horaria de la sesión a America/Bogota (GMT-5)
      await queryRunner.query(`ALTER SESSION SET TIME_ZONE = 'America/Bogota'`);

      await queryRunner.query(
        `BEGIN PKG_CENTRAL.DESCARGAR_INVENTARIO(:1, :2, :3, :4, :5, :6); END;`,
        [product.productId, lot.lotId, quantity, productCode, userId, 'VENTA'],
      );

      await queryRunner.commitTransaction();
      return {
        message: `Venta registrada exitosamente. ${quantity} unidades del producto "${product.productName}" han sido vendidas.`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getSalesByDateRange(
    startDate: Date | undefined,
    endDate: Date | undefined,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<HistoricalMovements>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.historicalMovementsRepository.createQueryBuilder(
      'historical_movements',
    );

    // Filtrar por movementReason = 'VENTA'
    queryBuilder.where('historical_movements.MOVEMENT_REASON = :reason', {
      reason: 'VENTA',
    });

    if (startDate) {
      queryBuilder.andWhere(
        'historical_movements.MOVEMENT_DATE >= :startDate',
        {
          startDate,
        },
      );
    }

    if (endDate) {
      queryBuilder.andWhere('historical_movements.MOVEMENT_DATE <= :endDate', {
        endDate,
      });
    }

    queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('historical_movements.MOVEMENT_DATE', 'DESC');

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

  async getSalesStats(): Promise<SalesStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total de ventas históricas
    const totalSales = await this.historicalMovementsRepository.count({
      where: { movementReason: 'VENTA' },
    });

    // Total de unidades vendidas (suma de cantidades)
    const totalQuantityResult = (await this.historicalMovementsRepository
      .createQueryBuilder('historical_movements')
      .select('SUM(historical_movements.QUANTITY)', 'total')
      .where('historical_movements.MOVEMENT_REASON = :reason', {
        reason: 'VENTA',
      })
      .getRawOne()) as { total: string } | undefined;

    const totalQuantitySold = totalQuantityResult?.total
      ? parseInt(totalQuantityResult.total)
      : 0;

    // Contar ventas de hoy con filtro de fecha
    const salesTodayCount = await this.historicalMovementsRepository
      .createQueryBuilder('historical_movements')
      .where('historical_movements.MOVEMENT_REASON = :reason', {
        reason: 'VENTA',
      })
      .andWhere('historical_movements.MOVEMENT_DATE >= :today', { today })
      .andWhere('historical_movements.MOVEMENT_DATE < :tomorrow', { tomorrow })
      .getCount();

    // Cantidad vendida hoy
    const quantityTodayResult = (await this.historicalMovementsRepository
      .createQueryBuilder('historical_movements')
      .select('SUM(historical_movements.QUANTITY)', 'total')
      .where('historical_movements.MOVEMENT_REASON = :reason', {
        reason: 'VENTA',
      })
      .andWhere('historical_movements.MOVEMENT_DATE >= :today', { today })
      .andWhere('historical_movements.MOVEMENT_DATE < :tomorrow', { tomorrow })
      .getRawOne()) as { total: string } | undefined;

    const quantitySoldToday = quantityTodayResult?.total
      ? parseInt(quantityTodayResult.total)
      : 0;

    // Producto más vendido
    const topProductResult = (await this.historicalMovementsRepository
      .createQueryBuilder('historical_movements')
      .select('historical_movements.REFERENCE', 'productCode')
      .addSelect('historical_movements.PRODUCT_NAME', 'productName')
      .addSelect('SUM(historical_movements.QUANTITY)', 'totalQuantity')
      .where('historical_movements.MOVEMENT_REASON = :reason', {
        reason: 'VENTA',
      })
      .groupBy('historical_movements.REFERENCE')
      .addGroupBy('historical_movements.PRODUCT_NAME')
      .orderBy('SUM(historical_movements.QUANTITY)', 'DESC')
      .limit(1)
      .getRawOne()) as
      | { productCode: string; productName: string; totalQuantity: string }
      | undefined;

    const topSellingProduct = topProductResult
      ? {
          productCode: topProductResult.productCode,
          productName: topProductResult.productName,
          totalQuantity: parseInt(topProductResult.totalQuantity),
        }
      : null;

    return {
      totalSales,
      totalQuantitySold,
      salesToday: salesTodayCount,
      quantitySoldToday,
      topSellingProduct,
    };
  }
}
