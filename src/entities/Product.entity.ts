import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductCategory } from './Product-category.entity';
import { MeasurementType } from './Measurement-type.entity';
import { ProductState } from './Product-state.entity';
import { Inventory } from './Inventory.entity';

@Entity('PRODUCTS')
export class Product {
  @PrimaryGeneratedColumn({ name: 'PRODUCT_ID' })
  productId: number;

  @Column({ name: 'PRODUCT_NAME', length: 40, nullable: false })
  productName: string;

  @Column({ name: 'PRODUCT_DESCRIPTION', length: 200, nullable: true })
  productDescription: string;

  @Column({ name: 'PRODUCT_CODE', length: 30, nullable: true })
  productCode: string;

  @Column({
    name: 'UNIT_PRICE',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  unitPrice: number;

  @Column({ name: 'CATEGORY_ID', nullable: true })
  categoryId: number;

  @Column({ name: 'MEASUREMENT_ID', nullable: true })
  measurementId: number;

  @Column({ name: 'STATE_ID', nullable: true })
  stateId: number;

  @Column({
    name: 'CREATED_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // Relaciones
  @ManyToOne(() => ProductCategory, (category) => category.products)
  @JoinColumn({ name: 'CATEGORY_ID' })
  category: ProductCategory;

  @ManyToOne(() => MeasurementType, (measurement) => measurement.products)
  @JoinColumn({ name: 'MEASUREMENT_ID' })
  measurement: MeasurementType;

  @ManyToOne(() => ProductState, (state) => state.products)
  @JoinColumn({ name: 'STATE_ID' })
  state: ProductState;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventories: Inventory[];
}
