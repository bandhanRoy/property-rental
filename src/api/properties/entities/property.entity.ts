import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PropertyStatusEnum } from '../../../enums/property.enum';
import { Contract } from '../../contracts/entities/contract.entity';
import { Landlord } from '../../users/entities/landlord.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  address: string;

  @Column()
  size: string;

  @Column()
  description: string;

  @Column()
  amenities: string;

  @Column({ enum: PropertyStatusEnum, default: PropertyStatusEnum.vacant })
  status: PropertyStatusEnum;

  @Column({ type: 'date', default: null })
  termination_date: Date;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  closest_availability: Date;

  @Column()
  rent_amount: number;

  @ManyToOne(() => Landlord, (landlord) => landlord.properties)
  landlord: Landlord;

  @OneToMany(() => Contract, (contract) => contract.property) // specify inverse side as a second parameter
  contracts: Contract[];

  @OneToMany(() => Reservation, (reservation) => reservation.property)
  reservations: Reservation[];
}
