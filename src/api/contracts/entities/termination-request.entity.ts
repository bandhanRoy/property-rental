import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contract } from './contract.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class TerminationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Contract)
  @JoinColumn()
  contract: Contract;

  @Column('date')
  request_termination_date: Date;

  @CreateDateColumn()
  approved_at: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requested_by: User;

  @OneToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approved_by: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
