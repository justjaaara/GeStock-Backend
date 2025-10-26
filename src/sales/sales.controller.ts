import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { AuthUser } from 'src/auth/interfaces/auth-user.interface';

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
}

