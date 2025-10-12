import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.entity';

@Entity({ name: 'ROLES' })
export class Role {
  @PrimaryGeneratedColumn({ name: 'ROLE_ID' })
  role_id: number;

  @Column({ name: 'ROLE_NAME', type: 'varchar', length: 20, nullable: false })
  role_name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
