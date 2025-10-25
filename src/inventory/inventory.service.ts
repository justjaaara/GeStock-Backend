import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryView } from 'src/entities/Inventory-view.entity';
import { Repository } from 'typeorm';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';

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
}
