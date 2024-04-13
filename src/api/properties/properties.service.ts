import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  In,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PropertyStatusEnum } from '../../enums/property.enum';
import { UserTypeEnum } from '../../enums/user.enum';
import { getLoggerPrefix } from '../../utils/logger.util';
import { ReservationsService } from '../reservations/reservations.service';
import { UsersService } from '../users/users.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { CreateReservationBodyDto } from './dto/create-reservation.dto';
import { Property } from './entities/property.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly userService: UsersService,
    private readonly reservationService: ReservationsService,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    landlordId: string,
  ): Promise<string> {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    const property = new Property();
    property.address = createPropertyDto.address;
    property.size = createPropertyDto.size;
    property.description = createPropertyDto.description;
    property.amenities = createPropertyDto.amenities;
    property.rent_amount = createPropertyDto.rent_amount;
    property.landlord =
      await this.userService.findUserByType<UserTypeEnum.landlord>(
        UserTypeEnum.landlord,
        { where: { id: landlordId } },
      );
    const saved = await this.propertyRepository.save(property);
    if (saved) {
      Logger.log(`${getLoggerPrefix()}: Property saved successfully`);
      return saved.id;
    }
    Logger.warn(`${getLoggerPrefix()}: Cannot save property`);
    throw new InternalServerErrorException('Cannot save property');
  }

  async createReservation(
    propertyId: string,
    tenantId: string,
    createReservationDto: CreateReservationBodyDto,
  ): Promise<string> {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    const property = await this.findProperty({
      where: { id: propertyId, status: PropertyStatusEnum.vacant },
    });
    if (!property) {
      Logger.log(
        `${getLoggerPrefix()}: Property not found or property not vacant`,
      );
      throw new NotFoundException('Property not found');
    }
    const tenant = await this.userService.findUserByType<UserTypeEnum.tenant>(
      UserTypeEnum.tenant,
      {
        where: { id: tenantId },
      },
    );
    return await this.reservationService.create({
      property,
      tenant,
      ...createReservationDto,
    });
  }

  async findProperty(options: FindOneOptions<Property>): Promise<Property> {
    return await this.propertyRepository.findOne(options);
  }

  async findProperties(
    options: FindManyOptions<Property>,
  ): Promise<Property[]> {
    return await this.propertyRepository.find(options);
  }

  async getProperty(propertyId: string): Promise<Property> {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    return await this.findProperty({
      where: {
        id: propertyId,
      },
      relations: {
        landlord: {
          user: true,
        },
        contracts: {
          tenants: {
            user: true,
          },
        },
      },
      select: {
        id: true,
        address: true,
        amenities: true,
        closest_availability: true,
        description: true,
        size: true,
        status: true,
        landlord: {
          id: true,
          user: {
            id: true,
            name: true,
          },
        },
        contracts: {
          id: true,
          tenants: {
            id: true,
            user: {
              id: true,
              name: true,
            },
          },
        },
      },
    });
  }

  async getAllProperties(
    tenant: string,
    landlord: string,
    limit: number,
    skip: number,
  ): Promise<Property[]> {
    console.log({ tenant, landlord });
    const where: FindOptionsWhere<Property>[] = [];
    switch (true) {
      case tenant !== null:
        where.push({
          status: In([
            PropertyStatusEnum.vacant,
            PropertyStatusEnum.has_termination_date,
          ]),
        });
      case landlord !== null:
        where.push({
          landlord: {
            id: landlord,
          },
        });
      default:
        break;
    }
    return await this.findProperties({
      where,
      relations: {
        landlord: {
          user: true,
        },
      },
      select: {
        id: true,
        address: true,
        size: true,
        description: true,
        amenities: true,
        status: true,
        termination_date: true,
        closest_availability: true,
        rent_amount: true,
        landlord: {
          id: true,
          user: {
            name: true,
          },
        },
      },
      skip,
      take: limit,
    });
  }

  async updateProperty(
    criteria: FindOptionsWhere<Property>,
    partialEntity: QueryDeepPartialEntity<Property>,
  ): Promise<UpdateResult> {
    Logger.log(`${getLoggerPrefix()} Inside function`);
    return await this.propertyRepository.update(criteria, partialEntity);
  }

  async save(entity: Property): Promise<Property> {
    Logger.log(`${getLoggerPrefix()} Inside function`);
    return await this.propertyRepository.save(entity);
  }
}
