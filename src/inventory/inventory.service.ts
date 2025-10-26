import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryView } from 'src/entities/Inventory-view.entity';
import { Repository } from 'typeorm';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { MonthlyClosureResponseDto } from './dto/monthly-closure-response.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryView)
    private readonly inventoryViewRepository: Repository<InventoryView>,
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
}
