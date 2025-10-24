import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  ProductStateResponseDto,
  MeasurementTypeResponseDto,
} from './dto/product-state-response.dto';

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

  @Get('categories')
  @ApiOperation({
    summary: 'Obtener todas las categorías de productos',
    description:
      'Retorna la lista completa de categorías de productos disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Categorías obtenidas exitosamente',
    type: [CategoryResponseDto],
  })
  async getAllCategories(): Promise<CategoryResponseDto[]> {
    return await this.productsService.getAllCategories();
  }

  @Get('states/:productCode')
  @ApiOperation({
    summary: 'Obtener el estado de un producto específico por código',
    description:
      'Retorna el estado (activo, inactivo, etc.) de un producto específico por su código',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del producto obtenido exitosamente',
    type: ProductStateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado o sin estado asignado',
  })
  async getProductState(
    @Param('productCode') productCode: string,
  ): Promise<ProductStateResponseDto> {
    return await this.productsService.getProductState(productCode);
  }

  @Get('measurement-types')
  @ApiOperation({
    summary: 'Obtener todos los tipos de medidas',
    description:
      'Retorna la lista completa de tipos de medidas disponibles (unidad, kilogramo, litro, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipos de medidas obtenidos exitosamente',
    type: [MeasurementTypeResponseDto],
  })
  async getAllMeasurementTypes(): Promise<MeasurementTypeResponseDto[]> {
    return await this.productsService.getAllMeasurementTypes();
  }
}
