import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoricalMovements } from 'src/entities/Historical-movements.entity';
import {
  PaginationDto,
  PaginatedResponseDto,
} from '../inventory/dto/pagination.dto';

@Injectable()
export class HistoricalMovementsService {
  constructor(
    @InjectRepository(HistoricalMovements)
    private readonly historicalMovementsRepository: Repository<HistoricalMovements>,
  ) {}

  async getHistoricalMovements(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<HistoricalMovements>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, totalItems] =
      await this.historicalMovementsRepository.findAndCount({
        skip,
        take: limit,
        order: {
          movementDate: 'DESC',
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

  async getHistoricalMovementsByProduct(
    productName: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<HistoricalMovements>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, totalItems] =
      await this.historicalMovementsRepository.findAndCount({
        where: { productName },
        skip,
        take: limit,
        order: {
          movementDate: 'DESC',
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

  async getHistoricalMovementsByType(
    movementType: 'ENTRADA' | 'SALIDA',
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<HistoricalMovements>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, totalItems] =
      await this.historicalMovementsRepository.findAndCount({
        where: { movementType },
        skip,
        take: limit,
        order: {
          movementDate: 'DESC',
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

  async getHistoricalMovementsFiltered(filters: {
    productName?: string;
    movementType?: 'ENTRADA' | 'SALIDA';
    startDate?: Date;
    endDate?: Date;
    paginationDto: PaginationDto;
  }): Promise<PaginatedResponseDto<HistoricalMovements>> {
    const { productName, movementType, startDate, endDate, paginationDto } =
      filters;
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.historicalMovementsRepository.createQueryBuilder(
      'historical_movements',
    );

    if (productName) {
      queryBuilder.andWhere(
        'historical_movements.PRODUCT_NAME = :productName',
        {
          productName,
        },
      );
    }

    if (movementType) {
      queryBuilder.andWhere(
        'historical_movements.MOVEMENT_TYPE = :movementType',
        {
          movementType,
        },
      );
    }

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

  async getHistoricalMovementsByReason(
    movementReason: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<HistoricalMovements>> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, totalItems] =
      await this.historicalMovementsRepository.findAndCount({
        where: { movementReason },
        skip,
        take: limit,
        order: {
          movementDate: 'DESC',
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
}
