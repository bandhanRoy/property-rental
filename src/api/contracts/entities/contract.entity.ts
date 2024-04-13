import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Tenant } from '../../users/entities/tenant.entity';
import { Terms } from './terms.entity';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.contracts)
  property: Property;

  @OneToMany(() => Tenant, (tenant) => tenant.contract)
  tenants: Tenant[];

  @OneToMany(() => Terms, (terms) => terms.contract)
  terms: Terms[];

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', default: null })
  end_date: Date;

  @Column()
  rent_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
