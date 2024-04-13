import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Landlord } from './landlord.entity';
import { Tenant } from './tenant.entity';
import { Authentication } from '../../authentication/entities/authentication.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToOne(() => Landlord, (landlord) => landlord.user) // specify inverse side as a second parameter
  @JoinColumn()
  landlord: Landlord;

  @OneToOne(() => Tenant, (tenant) => tenant.user) // specify inverse side as a second parameter
  @JoinColumn()
  tenant: Tenant;

  @OneToMany(() => Authentication, (authentication) => authentication.user)
  tokens: Authentication[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
