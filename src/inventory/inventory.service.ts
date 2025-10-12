import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryView } from 'src/entities/Inventory-view.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryView)
    private readonly inventoryViewRepository: Repository<InventoryView>,
  ) {}

  async getInvetoryDetail() {
    return await this.inventoryViewRepository.find();
  }

  async getInventoryByCategory(category: string) {
    const inventoryData = await this.inventoryViewRepository.find({
      where: {
        productCategory: category,
      },
    });

    return inventoryData;
  }

  async getLowStockProducts() {
    const inventoryData = await this.inventoryViewRepository
      .createQueryBuilder('inventory')
      .where('inventory.STOCK_ACTUAL <= inventory.STOCK_MINIMO')
      .getMany();
    return inventoryData;
  }
}
