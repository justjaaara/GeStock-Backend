import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo producto con inventario inicial',
    description:
      'Crea un producto con código automático y su registro de inventario inicial. El código se genera con formato {CATEGORIA}-{CONSECUTIVO}. El estado inicial es siempre "Activo".',
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría, medida o lote no encontrado',
  })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.createProduct(createProductDto);
  }
}
