import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { HistoricalMovementsService } from './historical-movements.service';
import { HistoricalMovements } from 'src/entities/Historical-movements.entity';
import {
  PaginationDto,
  PaginatedResponseDto,
} from '../inventory/dto/pagination.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FilterHistoricalMovementsDto } from './dto/filter-historical-movements.dto';

@ApiTags('Historical Movements')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1, 2)
@Controller('historical-movements')
export class HistoricalMovementsController {
  constructor(
    private readonly historicalMovementsService: HistoricalMovementsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener histórico de movimientos paginado',
    description:
      'Retorna todos los movimientos de inventario con paginación. Ordenados por fecha descendente.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad de movimientos por página',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de movimientos obtenido exitosamente',
    type: PaginatedResponseDto<HistoricalMovements>,
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para acceder a este recurso',
  })
  async getHistoricalMovements(@Query() paginationDto: PaginationDto) {
    return await this.historicalMovementsService.getHistoricalMovements(
      paginationDto,
    );
  }

  @Get('product')
  @ApiOperation({
    summary: 'Obtener histórico de movimientos por producto',
    description:
      'Retorna todos los movimientos de un producto específico con paginación',
  })
  @ApiQuery({
    name: 'productName',
    description: 'Nombre del producto',
    example: 'Coca Cola 500ml',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad de movimientos por página',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de movimientos obtenido exitosamente',
    type: PaginatedResponseDto<HistoricalMovements>,
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para acceder a este recurso',
  })
  async getHistoricalMovementsByProduct(
    @Query('productName') productName: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.historicalMovementsService.getHistoricalMovementsByProduct(
      productName,
      paginationDto,
    );
  }

  @Get('type')
  @ApiOperation({
    summary: 'Obtener histórico de movimientos por tipo',
    description: 'Retorna movimientos filtrados por tipo (ENTRADA o SALIDA)',
  })
  @ApiQuery({
    name: 'movementType',
    description: 'Tipo de movimiento',
    enum: ['ENTRADA', 'SALIDA'],
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad de movimientos por página',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de movimientos obtenido exitosamente',
    type: PaginatedResponseDto<HistoricalMovements>,
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para acceder a este recurso',
  })
  async getHistoricalMovementsByType(
    @Query('movementType') movementType: 'ENTRADA' | 'SALIDA',
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.historicalMovementsService.getHistoricalMovementsByType(
      movementType,
      paginationDto,
    );
  }

  @Get('filtered')
  @ApiOperation({
    summary: 'Obtener histórico de movimientos filtrado',
    description:
      'Obtiene movimientos filtrados por producto, tipo de movimiento y/o rango de fechas',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de movimientos obtenido exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para acceder a este recurso',
  })
  async getHistoricalMovementsFiltered(
    @Query() filterDto: FilterHistoricalMovementsDto,
    @Query() paginationDto: PaginationDto,
  ) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (filterDto.startDate) {
      startDate = new Date(filterDto.startDate);
    }

    if (filterDto.endDate) {
      endDate = new Date(filterDto.endDate);
    }

    return await this.historicalMovementsService.getHistoricalMovementsFiltered(
      {
        productName: filterDto.productName,
        movementType: filterDto.movementType,
        startDate,
        endDate,
        paginationDto,
      },
    );
  }
}
