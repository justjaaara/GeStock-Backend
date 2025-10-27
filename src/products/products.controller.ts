import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  ProductStateResponseDto,
  MeasurementTypeResponseDto,
} from './dto/product-state-response.dto';
import { ProductForSaleDto } from './dto/product-for-sale.dto';
import {
  PaginationDto,
  PaginatedResponseDto,
} from '../inventory/dto/pagination.dto';

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

  @Get('for-sale')
  @ApiOperation({
    summary: 'Obtener todos los productos disponibles para vender',
    description:
      'Retorna la lista de productos activos disponibles para vender con información de inventario',
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
    description: 'Productos disponibles obtenidos exitosamente',
    type: PaginatedResponseDto<ProductForSaleDto>,
  })
  async getProductsForSale(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<ProductForSaleDto>> {
    return await this.productsService.getProductsForSale(paginationDto);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de productos',
    description: 'Retorna el total de productos, productos activos e inactivos',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalProducts: { type: 'number', example: 1523 },
        activeProducts: { type: 'number', example: 1518 },
        inactiveProducts: { type: 'number', example: 5 },
      },
    },
  })
  async getProductStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
  }> {
    return await this.productsService.getProductStats();
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

  @Get(':productCode')
  @ApiOperation({
    summary: 'Obtener un producto por código',
    description:
      'Retorna la información completa de un producto específico incluyendo su inventario actual',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto obtenido exitosamente',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async getProductByCode(
    @Param('productCode') productCode: string,
  ): Promise<ProductResponseDto> {
    return await this.productsService.getProductByCode(productCode);
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

  @Put(':productCode')
  @ApiOperation({
    summary: 'Actualizar un producto por código',
    description:
      'Actualiza la información de un producto específico. Solo se pueden modificar: nombre, descripción, precio y categoría.',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o categoría no encontrada',
  })
  async updateProduct(
    @Param('productCode') productCode: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.updateProduct(
      productCode,
      updateProductDto,
    );
  }

  @Delete(':productCode')
  @ApiOperation({
    summary: 'Eliminar un producto por código',
    description:
      'Elimina un producto y todos sus registros de inventario asociados. Esta acción no se puede deshacer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Producto BEBIDAS-001 eliminado exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async deleteProduct(
    @Param('productCode') productCode: string,
  ): Promise<{ message: string }> {
    return await this.productsService.deleteProduct(productCode);
  }
}
