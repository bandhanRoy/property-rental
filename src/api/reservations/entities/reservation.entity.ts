import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Tenant } from '../../users/entities/tenant.entity';
import { ReservationStatusEnum } from '../../../enums/reservation.enum';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.reservations, {
    onDelete: 'CASCADE',
  })
  property: Property;

  @ManyToOne(() => Tenant, (tenant) => tenant.reservations, {
    onDelete: 'CASCADE',
  })
  tenant: Tenant;

  @CreateDateColumn()
  reservation_date: Date;

  @Column({ type: 'date' })
  desired_move_in_date: Date;

  @Column({
    enum: ReservationStatusEnum,
    default: ReservationStatusEnum.pending,
  })
  status: ReservationStatusEnum;

  @UpdateDateColumn()
  updated_at: Date;
}
