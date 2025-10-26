import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/entities/Product.entity';
import { Inventory } from 'src/entities/Inventory.entity';
import { InventoryView } from 'src/entities/Inventory-view.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryView)
    private readonly inventoryViewRepository: Repository<InventoryView>,
  ) {}

  async createSale(
    createSaleDto: CreateSaleDto,
    userId: number,
  ): Promise<{ message: string }> {
    const { productCode, quantity } = createSaleDto;

    // Buscar producto por código
    const product = await this.productRepository.findOne({
      where: { productCode },
    });

    if (!product) {
      throw new NotFoundException(
        `Producto con código "${productCode}" no encontrado`,
      );
    }

    // Verificar stock disponible
    const inventory = await this.inventoryViewRepository.findOne({
      where: { productCode },
    });

    if (!inventory) {
      throw new NotFoundException(
        `No hay registro de inventario para el producto con código "${productCode}"`,
      );
    }

    if (inventory.currentStock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Stock disponible: ${inventory.currentStock}, Cantidad solicitada: ${quantity}`,
      );
    }

    // Obtener el lote más reciente del producto
    const lot = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.productId = :productId', {
        productId: product.productId,
      })
      .orderBy('inventory.createdAt', 'DESC')
      .getOne();

    if (!lot) {
      throw new NotFoundException(
        `No hay lotes registrados para el producto con código "${productCode}"`,
      );
    }

    // Ejecutar procedimiento DESCARGAR_INVENTARIO
    const connection = this.inventoryRepository.manager.connection;
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `BEGIN PKG_CENTRAL.DESCARGAR_INVENTARIO(:1, :2, :3, :4, :5, :6); END;`,
        [product.productId, lot.lotId, quantity, productCode, userId, 'VENTA'],
      );

      await queryRunner.commitTransaction();
      return {
        message: `Venta registrada exitosamente. ${quantity} unidades del producto "${product.productName}" han sido vendidas.`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
