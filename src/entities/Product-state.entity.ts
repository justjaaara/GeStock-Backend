import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './Product.entity';

@Entity('PRODUCT_STATES')
export class ProductState {
  @PrimaryGeneratedColumn({ name: 'STATE_ID' })
  stateId: number;

  @Column({ name: 'STATE_NAME', length: 20, nullable: false, unique: true })
  stateName: string;

  @OneToMany(() => Product, (product) => product.state)
  products: Product[];
}
