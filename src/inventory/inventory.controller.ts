import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { InventoryResponseDto } from './dto/inventory-respose.dto';

@ApiTags('Inventory')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener inventario completo',
    description: 'Retorna todos los productos del inventario con sus detalles',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario obtenido exitosamente',
    type: [InventoryResponseDto],
  })
  async getInventory() {
    return await this.inventoryService.getInvetoryDetail();
  }

  @Get('category')
  @ApiOperation({
    summary: 'Obtener inventario por categoría',
    description: 'Retorna productos del inventario filtrados por categoría',
  })
  @ApiQuery({
    name: 'name',
    description: 'Nombre de la categoría',
    example: 'Bebidas',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario por categoría obtenido exitosamente',
    type: [InventoryResponseDto],
  })
  async getInventoryByCategory(@Query('categoryName') category: string) {
    return await this.inventoryService.getInventoryByCategory(category);
  }

  @Get('low-stock')
  @ApiOperation({
    summary: 'Obtener productos con stock bajo',
    description:
      'Retorna productos cuyo stock actual es menor o igual al stock mínimo',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos con stock bajo obtenidos exitosamente',
    type: [InventoryResponseDto],
  })
  async getLowStockProducts() {
    return await this.inventoryService.getLowStockProducts();
  }
}
