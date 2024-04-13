import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Contract } from '../../contracts/entities/contract.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.tenant) // specify inverse side as a second parameter
  user: User;

  @ManyToOne(() => Contract, (contract) => contract.tenants)
  contract: Contract;

  @OneToMany(() => Reservation, (reservation) => reservation.tenant)
  reservations: Reservation[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
