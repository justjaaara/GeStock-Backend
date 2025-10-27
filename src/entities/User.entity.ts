import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './Role.entity';
import { UserState } from './User-state.entity';

@Entity({ name: 'USERS' })
export class User {
  @PrimaryGeneratedColumn({ name: 'USER_ID' })
  user_id: number;

  @Column({ name: 'NAME', type: 'varchar', length: 25, nullable: false })
  name: string;

  @Column({
    name: 'EMAIL',
    type: 'varchar',
    length: 254,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({ name: 'PASSWORD', type: 'varchar', length: 60, nullable: false })
  @Exclude()
  password: string;

  @Column({ name: 'STATE_ID' })
  state_id: number;

  @Column({ name: 'ROLE_ID' })
  role_id: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'ROLE_ID' })
  role: Role;

  @ManyToOne(() => UserState, (state) => state.users)
  @JoinColumn({ name: 'STATE_ID' })
  state: UserState;
}
