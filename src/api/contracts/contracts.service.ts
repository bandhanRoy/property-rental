import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { Contract } from './entities/contract.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertiesService } from '../properties/properties.service';
import { UsersService } from '../users/users.service';
import { Terms } from './entities/terms.entity';
import { UserTypeEnum } from '../../enums/user.enum';
import { getLoggerPrefix } from '../../utils/logger.util';
import { PropertyStatusEnum } from '../../enums/property.enum';
import { TerminationRequest } from './entities/termination-request.entity';
import { RequestContractTerminationBodyDto } from './dto/request-contract-termination.dto';
import { UpdateContractBodyDto } from './dto/update-contract.dto';
import { CreateTermsDto } from './dto/create-terms.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Terms)
    private readonly termsRepository: Repository<Terms>,
    @InjectRepository(TerminationRequest)
    private readonly terminationRequestRepository: Repository<TerminationRequest>,
    private readonly propertyService: PropertiesService,
    private readonly userService: UsersService,
  ) {}

  async create(createContractDto: CreateContractDto): Promise<string> {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    const contract = new Contract();
    const [property, terms, tenants] = await Promise.all([
      this.propertyService.findProperty({
        where: { id: createContractDto.property_id },
      }),
      this.termsRepository.find({ where: { id: In(createContractDto.terms) } }),
      this.userService.findUsersByType<UserTypeEnum.tenant>(
        UserTypeEnum.tenant,
        { where: { id: In(createContractDto.tenants) } },
      ),
    ]);
    contract.property = property;
    contract.start_date = createContractDto.start_date;
    contract.end_date = createContractDto.end_date;
    contract.rent_amount = createContractDto.rent_amount;
    contract.tenants = tenants;
    contract.terms = terms;
    const saved = await this.contractRepository.save(contract);
    if (!saved) {
      Logger.warn(`${getLoggerPrefix()}: Contract cannot be saved`);
      throw new InternalServerErrorException('Contract cannot be saved');
    }
    // update property set status as occupied and set termination date to the end_date
    property.status = PropertyStatusEnum.rented;
    property.termination_date = createContractDto.end_date;
    property.closest_availability = createContractDto.end_date;
    const updated = await this.propertyService.updateProperty(
      { id: contract.property.id },
      property,
    );
    if (!updated) {
      Logger.log(`${getLoggerPrefix()} Cannot update property`);
      throw new InternalServerErrorException('Cannot update property');
    }
    return contract.id;
  }

  async createTerms(createTermsDto: CreateTermsDto): Promise<string> {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    const term = new Terms();
    term.term = createTermsDto.term;
    const saved = await this.termsRepository.save(term);
    if (!saved) {
      Logger.warn(`${getLoggerPrefix()}: Term not saved`);
      throw new InternalServerErrorException('Term not saved');
    }
    return saved.id;
  }

  async findOne(id: string): Promise<Contract> {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    return await this.contractRepository.findOne({
      where: { id },
      relations: {
        terms: true,
        tenants: true,
        property: {
          landlord: true,
        },
      },
      select: {
        id: true,
        property: {
          id: true,
          address: true,
          size: true,
          description: true,
          amenities: true,
        },
        tenants: {
          id: true,
          user: {
            id: true,
            name: true,
          },
        },
        terms: {
          id: true,
          term: true,
        },
        start_date: true,
        end_date: true,
        rent_amount: true,
      },
    });
  }

  async update(
    id: string,
    landlord: string,
    updateContractDto: UpdateContractBodyDto,
  ) {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    const contract = await this.contractRepository.findOne({
      where: { id, property: { landlord: { id: landlord } } },
      relations: { property: true, tenants: true, terms: true },
    });
    if (!contract) {
      Logger.warn(`${getLoggerPrefix()}: Contract Not Found`);
      throw new NotFoundException('Contract not found');
    }
    if (updateContractDto.terms) {
      if (updateContractDto.terms?.remove?.length) {
        contract.terms = contract.terms.filter(
          (term) => !updateContractDto.terms.remove.includes(term.id),
        );
      }

      if (updateContractDto.terms?.add?.length) {
        const newTerms = await this.termsRepository.find({
          where: { id: In(updateContractDto.terms.add) },
        });
        contract.terms.push(...newTerms);
      }
    }

    if (updateContractDto.tenants) {
      if (updateContractDto.tenants?.remove?.length) {
        contract.tenants = contract.tenants.filter(
          (term) => !updateContractDto.tenants.remove.includes(term.id),
        );
      }

      if (updateContractDto.tenants?.add?.length) {
        const newTenants =
          await this.userService.findUsersByType<UserTypeEnum.tenant>(
            UserTypeEnum.tenant,
            {
              where: { id: In(updateContractDto.tenants.add) },
            },
          );
        contract.tenants.push(...newTenants);
      }
    }
    contract.rent_amount =
      updateContractDto.rent_amount || contract.rent_amount;
    contract.end_date = updateContractDto.end_date || contract.end_date;
    console.log(contract);
    const updated = await this.contractRepository.save(contract);
    if (!updated) {
      Logger.log(`${getLoggerPrefix()}: Contract cannot be updated`);
      throw new InternalServerErrorException('Contract cannot be updated');
    }
    Logger.log(`${getLoggerPrefix()}: Contract updated successfully`);
  }

  async remove(id: string, landlord: string): Promise<void> {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    const contract = await this.contractRepository.findOne({
      where: { id, property: { landlord: { id: landlord } } },
      relations: { property: true },
    });
    if (!contract) {
      Logger.warn(`${getLoggerPrefix()}: Contract not found`);
      throw new NotFoundException('Contract not found');
    }
    const property = await this.propertyService.getProperty(
      contract.property.id,
    );
    property.status = PropertyStatusEnum.vacant;
    property.termination_date = new Date();
    property.closest_availability = new Date();
    await Promise.all([
      this.propertyService.save(property),
      this.contractRepository.softDelete({ id }),
    ]);
    return;
  }

  async terminationRequest(
    contractId: string,
    landlord: string,
    tenant: string,
    requestContactTermination: RequestContractTerminationBodyDto,
  ): Promise<string> {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    const contract = await this.contractRepository.findOne({
      where: {
        id: contractId,
        property: { status: PropertyStatusEnum.rented },
      },
      relations: { property: { landlord: true } },
    });
    if (!contract) {
      Logger.warn(`${getLoggerPrefix()}: Contract not found`);
      throw new NotFoundException('Contract not found');
    }
    // fetch the request by
    // if contract.property.landlord.id matches with the landlord id from token that means the landlord is requesting for termination
    // else tenant is requesting for termination
    const user = await this.userService.findUser({
      where:
        contract.property.landlord.id === landlord
          ? { landlord: { id: landlord } }
          : { tenant: { id: tenant } },
    });
    const terminationRequest = new TerminationRequest();
    terminationRequest.contract = contract;
    terminationRequest.requested_by = user;
    terminationRequest.request_termination_date =
      requestContactTermination.request_termination_date;
    const saved =
      await this.terminationRequestRepository.save(terminationRequest);
    if (!saved) {
      Logger.warn(`${getLoggerPrefix()}: Failed to save termination request`);
      throw new InternalServerErrorException(
        'Failed to save termination request',
      );
    }
    return saved.id;
  }
}
