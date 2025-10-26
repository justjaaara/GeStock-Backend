import { ViewEntity, Column } from 'typeorm';

@ViewEntity('VW_HISTORICAL_MOVEMENTS')
export class HistoricalMovements {
  @Column({ name: 'MOVEMENT_ID', primary: true })
  movementId: number;

  @Column({ name: 'MOVEMENT_DATE', type: 'timestamp' })
  movementDate: Date;

  @Column({ name: 'PRODUCT_NAME', length: 40 })
  productName: string;

  @Column({ name: 'MOVEMENT_TYPE', length: 20 })
  movementType: string;

  @Column({ name: 'MOVEMENT_REASON', length: 255, nullable: true })
  movementReason: string | null;

  @Column({ name: 'QUANTITY', type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'USER_NAME', length: 100 })
  userName: string;

  @Column({ name: 'REFERENCE', length: 100, nullable: true })
  reference: string;
}
