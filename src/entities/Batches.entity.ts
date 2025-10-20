import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('BATCHES')
export class Batch {
  @PrimaryGeneratedColumn({ name: 'LOT_ID' })
  lotId: number;

  @Column({ name: 'RFID_CODE', length: 40, nullable: false })
  rfidCode: string;

  @Column({ name: 'DESCRIPTION', length: 200, nullable: true })
  description: string;

  @Column({ name: 'ENTRY_DATE', type: 'timestamp', nullable: false })
  entryDate: Date;
}
