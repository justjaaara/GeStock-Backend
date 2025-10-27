import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from './User.entity';

@Entity({ name: 'USER_STATES' })
export class UserState {
  @PrimaryGeneratedColumn({ name: 'STATE_ID' })
  stateId: number;

  @Column({ name: 'STATE_NAME', length: 20, nullable: false, unique: true })
  stateName: string;

  @OneToMany(() => User, (user) => user.state)
  users: User[];
}
