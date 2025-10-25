import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
}
