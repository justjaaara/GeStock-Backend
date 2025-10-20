import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './Product.entity';

@Entity('PRODUCT_CATEGORIES')
export class ProductCategory {
  @PrimaryGeneratedColumn({ name: 'CATEGORY_ID' })
  categoryId: number;

  @Column({ name: 'CATEGORY_NAME', length: 30, nullable: false, unique: true })
  categoryName: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
