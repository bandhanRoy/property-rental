import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contract } from './contract.entity';

@Entity()
export class Terms {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  term: string;

  @ManyToOne(() => Contract, (contract) => contract.terms)
  contract: Contract;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
