import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { InventoryResponseDto } from './dto/inventory-response.dto';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { MonthlyClosureResponseDto } from './dto/monthly-closure-response.dto';
import { ClosureHeaderResponseDto } from './dto/closure-header-response.dto';
import { AuthUser } from 'src/auth/interfaces/auth-user.interface';
import { InventoryReportSummaryDto } from './dto/inventory-report.dto';
import { SalesByCategorySummaryDto } from './dto/sales-by-category.dto';
import { IncomeByLotSummaryDto } from './dto/income-by-lot.dto';

@ApiTags('Inventory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener inventario completo paginado',
    description: 'Retorna todos los productos del inventario con paginación',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad de productos por página',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario obtenido exitosamente',
    type: PaginatedResponseDto<InventoryResponseDto>,
  })
  async getInventory(@Query() paginationDto: PaginationDto) {
    return await this.inventoryService.getInventoryDetail(paginationDto);
  }

  @Get('category')
  @ApiOperation({
    summary: 'Obtener inventario por categoría paginado',
    description:
      'Retorna productos del inventario filtrados por categoría con paginación',
  })
  @ApiQuery({
    name: 'categoryName',
    description: 'Nombre de la categoría',
    example: 'Bebidas',
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
    description: 'Cantidad de productos por página',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario por categoría obtenido exitosamente',
    type: PaginatedResponseDto<InventoryResponseDto>,
  })
  async getInventoryByCategory(
    @Query('categoryName') category: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.inventoryService.getInventoryByCategory(
      category,
      paginationDto,
    );
  }

  @Get('low-stock')
  @ApiOperation({
    summary: 'Obtener productos con stock bajo paginado',
    description:
      'Retorna productos cuyo stock actual es menor o igual al stock mínimo con paginación',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad de productos por página',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Productos con stock bajo obtenidos exitosamente',
    type: PaginatedResponseDto<InventoryResponseDto>,
  })
  async getLowStockProducts(@Query() paginationDto: PaginationDto) {
    return await this.inventoryService.getLowStockProducts(paginationDto);
  }

  @Get('filtered')
  @ApiOperation({
    summary: 'Obtener productos filtrados',
    description:
      'Obtiene productos del inventario filtrados por categoría, nivel de stock y estado.',
  })
  @ApiQuery({
    name: 'categoryName',
    required: false,
    type: String,
    description: 'Nombre de la categoría del producto',
  })
  @ApiQuery({
    name: 'stockLevel',
    required: false,
    enum: ['critical', 'low', 'out'],
    description: 'Nivel de stock: crítico, bajo o sin stock',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    enum: ['active', 'inactive'],
    description: 'Estado del producto: activo o inactivo',
  })
  async getFilteredProducts(
    @Query() paginationDto: PaginationDto,
    @Query('categoryName') categoryName?: string,
    @Query('stockLevel') stockLevel?: 'critical' | 'low' | 'out',
    @Query('state') state?: 'active' | 'inactive',
  ) {
    return await this.inventoryService.getFilteredProducts({
      categoryName,
      stockLevel,
      state,
      paginationDto,
    });
  }

  @Post('update-stock')
  @ApiOperation({
    summary: 'Actualizar stock de un producto',
    description:
      'Realiza una operación de cargue o descargue de inventario para un producto específico',
  })
  @ApiResponse({
    status: 201,
    description: 'Stock actualizado exitosamente',
    schema: {
      example: {
        message: 'Stock actualizado exitosamente con entrada de 10 unidades',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la solicitud',
    schema: {
      example: {
        message: 'Stock insuficiente para realizar la operación.',
      },
    },
  })
  async updateStock(@Body() updateStockDto: UpdateStockDto) {
    return await this.inventoryService.updateStock(updateStockDto);
  }

  @Post('generate-monthly-closure')
  @ApiOperation({
    summary: 'Generar cierre mensual del inventario',
    description:
      'Crea un cierre mensual del inventario actual. Solo se puede generar un cierre por mes. El usuario se obtiene del token JWT.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cierre mensual generado exitosamente',
    type: MonthlyClosureResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existe un cierre para este mes',
    schema: {
      example: {
        statusCode: 400,
        message: 'Ya existe un cierre para este mes.',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token inválido o expirado',
  })
  async generateMonthlyClosure(@Request() req: { user: AuthUser }) {
    return await this.inventoryService.generateMonthlyClosure(req.user.email);
  }

  @Get('report')
  @ApiOperation({
    summary: 'Generar reporte general de inventario',
    description:
      'Genera un reporte completo del inventario con unidades disponibles por producto. Historia de Usuario: GES-166',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte generado exitosamente',
    type: InventoryReportSummaryDto,
  })
  async generateInventoryReport(): Promise<InventoryReportSummaryDto> {
    return await this.inventoryService.generateInventoryReport();
  }

  @Get('report/sales-by-category')
  @ApiOperation({
    summary: 'Generar reporte de productos vendidos por categoría',
    description:
      'Genera un reporte de productos vendidos agrupados por categoría para entender la demanda. Historia de Usuario: GES-167',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de ventas por categoría generado exitosamente',
    type: SalesByCategorySummaryDto,
  })
  async generateSalesByCategoryReport(): Promise<SalesByCategorySummaryDto> {
    return await this.inventoryService.generateSalesByCategoryReport();
  }

  @Get('report/income-by-lot')
  @ApiOperation({
    summary: 'Generar reporte de ingresos por lote',
    description:
      'Genera un reporte de ingresos por lote para conocer cuándo y qué productos entraron. Historia de Usuario: GES-168',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de ingresos por lote generado exitosamente',
    type: IncomeByLotSummaryDto,
  })
  async generateIncomeByLotReport(): Promise<IncomeByLotSummaryDto> {
    return await this.inventoryService.generateIncomeByLotReport();
  }

  @Get('closures')
  @ApiOperation({
    summary: 'Obtener todos los cierres de inventario',
    description:
      'Retorna todos los cierres mensuales del inventario con paginación, ordenados por fecha descendente',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Cantidad de cierres por página',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Cierres obtenidos exitosamente',
    type: PaginatedResponseDto<ClosureHeaderResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - token inválido o expirado',
  })
  async getAllClosures(@Query() paginationDto: PaginationDto) {
    return await this.inventoryService.getAllClosures(paginationDto);
  }
}
