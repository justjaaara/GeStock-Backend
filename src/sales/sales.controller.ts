import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { AuthUser } from 'src/auth/interfaces/auth-user.interface';
import { FilterSalesByDateRangeDto } from './dto/filter-sales-by-date-range.dto';
import {
  PaginationDto,
  PaginatedResponseDto,
} from '../inventory/dto/pagination.dto';
import { HistoricalMovements } from 'src/entities/Historical-movements.entity';
import { SalesStatsDto } from './dto/sales-stats.dto';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Registrar una nueva venta',
    description:
      'Crea un registro de venta decrementando el inventario. Requiere código del producto y cantidad. El user_id se toma del token JWT y la razón es siempre "VENTA". Requiere autenticación JWT válida.',
  })
  @ApiResponse({
    status: 200,
    description: 'Venta registrada exitosamente',
    schema: {
      example: {
        message:
          'Venta registrada exitosamente. 10 unidades del producto "Coca Cola 500ml" han sido vendidas.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Stock insuficiente o producto no encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token inválido o expirado',
  })
  async createSale(
    @Body() createSaleDto: CreateSaleDto,
    @Request() req: { user: AuthUser },
  ) {
    return await this.salesService.createSale(createSaleDto, req.user.id);
  }

  @Get('filtered/date-range')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener ventas por rango de fechas',
    description:
      'Obtiene el histórico de ventas filtrado por un rango de fechas específico. Solo muestra movimientos con razón "VENTA".',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Fecha inicial del rango (ISO 8601)',
    required: false,
    example: '2025-10-20',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Fecha final del rango (ISO 8601)',
    required: false,
    example: '2025-10-25',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad de registros por página',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Ventas obtenidas exitosamente',
    type: PaginatedResponseDto<HistoricalMovements>,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token inválido o expirado',
  })
  async getSalesByDateRange(
    @Query() filterDto: FilterSalesByDateRangeDto,
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

    return await this.salesService.getSalesByDateRange(
      startDate,
      endDate,
      paginationDto,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener estadísticas de ventas',
    description:
      'Retorna estadísticas generales de ventas: total de ventas históricas, unidades vendidas totales, ventas de hoy, unidades vendidas hoy, y el producto más vendido.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    type: SalesStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token inválido o expirado',
  })
  async getSalesStats() {
    return await this.salesService.getSalesStats();
  }
}
