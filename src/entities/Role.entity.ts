import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  role_id: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  role_name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
