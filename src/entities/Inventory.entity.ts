import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './Product.entity';
import { Batch } from './Batches.entity';

@Entity('INVENTORY')
export class Inventory {
  @PrimaryGeneratedColumn({ name: 'INVENTORY_ID' })
  inventoryId: number;

  @Column({ name: 'PRODUCT_ID', nullable: false })
  productId: number;

  @Column({ name: 'LOT_ID', nullable: true })
  lotId: number;

  @Column({ name: 'ACTUAL_STOCK', nullable: false })
  actualStock: number;

  @Column({ name: 'MINIMUM_STOCK', nullable: true })
  minimumStock: number;

  // Relaciones
  @ManyToOne(() => Product, (product) => product.inventories)
  @JoinColumn({ name: 'PRODUCT_ID' })
  product: Product;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'LOT_ID' })
  batch: Batch;
}
