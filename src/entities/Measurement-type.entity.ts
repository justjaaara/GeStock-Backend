import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './Product.entity';

@Entity('MEASUREMENTS_TYPES')
export class MeasurementType {
  @PrimaryGeneratedColumn({ name: 'MEASUREMENT_ID' })
  measurementId: number;

  @Column({
    name: 'MEASUREMENT_NAME',
    length: 30,
    nullable: false,
    unique: true,
  })
  measurementName: string;

  @OneToMany(() => Product, (product) => product.measurement)
  products: Product[];
}
