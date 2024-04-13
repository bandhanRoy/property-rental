import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Repository } from 'typeorm';
import { CreateReservationBodyDto } from '../properties/dto/create-reservation.dto';
import { Property } from '../properties/entities/property.entity';
import { Tenant } from '../users/entities/tenant.entity';
import { getLoggerPrefix } from '../../utils/logger.util';
import { ReservationStatusEnum } from '../../enums/reservation.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(
    createReservationDto: CreateReservationBodyDto & {
      property: Property;
      tenant: Tenant;
    },
  ): Promise<string> {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    const reservation = new Reservation();
    reservation.desired_move_in_date =
      createReservationDto.desired_move_in_date;
    reservation.property = createReservationDto.property;
    reservation.tenant = createReservationDto.tenant;
    const saved = await this.reservationRepository.save(reservation);
    if (!saved) {
      Logger.warn(`${getLoggerPrefix()}: Reservation cannot be saved`);
      throw new InternalServerErrorException('Reservation cannot be saved');
    }
    Logger.log(`${getLoggerPrefix()}: Reservation saved successfully`);
    return saved.id;
  }

  async approveReservation(reservationId: string): Promise<void> {
    // get the reservation
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: { property: true },
    });
    if (!reservation) {
      Logger.log(`${getLoggerPrefix()}: Reservation not found`);
      throw new NotFoundException('Reservation not found');
    }
    reservation.status = ReservationStatusEnum.approved;
    const approved = await this.reservationRepository.update(
      { id: reservationId },
      reservation,
    );
    if (!approved) {
      Logger.warn(`${getLoggerPrefix()}: Cannot update reservation`);
      throw new InternalServerErrorException('Cannot update reservation');
    }
    // update all the pending reservations to cancelled
    await this.reservationRepository.update(
      { property: { id: reservation.property.id } },
      { status: ReservationStatusEnum.cancelled },
    );
  }

  async rejectReservation(reservationId: string): Promise<void> {
    // get the reservation
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });
    if (!reservation) {
      Logger.log(`${getLoggerPrefix()}: Reservation not found`);
      throw new NotFoundException('Reservation not found');
    }
    reservation.status = ReservationStatusEnum.cancelled;
    const approved = await this.reservationRepository.update(
      { id: reservationId },
      reservation,
    );
    if (!approved) {
      Logger.warn(`${getLoggerPrefix()}: Cannot update reservation`);
      throw new InternalServerErrorException('Cannot update reservation');
    }
  }
}
