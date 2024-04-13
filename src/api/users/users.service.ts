import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { UserTypeEnum } from '../../enums/user.enum';
import { getLoggerPrefix } from '../../utils/logger.util';
import { CreateUserDto } from '../authentication/dto/create-user.dto';
import { Landlord } from './entities/landlord.entity';
import { Tenant } from './entities/tenant.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Landlord)
    private readonly landlordRepository: Repository<Landlord>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    const user = new User();
    user.username = createUserDto.username;
    user.name = createUserDto.name;
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(createUserDto.password, salt);
    if (createUserDto.landlord) {
      const landlord = new Landlord();
      await this.landlordRepository.save(landlord);
      user.landlord = landlord;
    }
    if (createUserDto.tenant) {
      const tenant = new Tenant();
      await this.tenantRepository.save(tenant);
      user.tenant = tenant;
    }
    const saved = await this.userRepository.save(user);
    if (saved) {
      Logger.log(`${getLoggerPrefix()}: User saved successfully`);
      return true;
    }
    Logger.warn(`${getLoggerPrefix()}: User cannot be saved`);
    throw new InternalServerErrorException('User cannot be saved');
  }

  async findUserByType<T extends UserTypeEnum>(
    type: UserTypeEnum,
    options: FindOneOptions<Tenant | Landlord>,
  ): Promise<T extends UserTypeEnum.tenant ? Tenant : Landlord> {
    const userMap = {
      [UserTypeEnum.landlord]: this.landlordRepository,
      [UserTypeEnum.tenant]: this.tenantRepository,
    };
    return (await userMap[type].findOne(
      options,
    )) as T extends UserTypeEnum.tenant ? Tenant : Landlord;
  }

  async findUser(options: FindOneOptions<User>): Promise<User> {
    return await this.userRepository.findOne(options);
  }

  async findUsers(options: FindManyOptions<User>): Promise<User[]> {
    return await this.userRepository.find(options);
  }

  async findUsersByType<T extends UserTypeEnum>(
    type: UserTypeEnum,
    options: FindOneOptions<Tenant | Landlord>,
  ): Promise<(T extends UserTypeEnum.tenant ? Tenant : Landlord)[]> {
    const userMap = {
      [UserTypeEnum.landlord]: this.landlordRepository,
      [UserTypeEnum.tenant]: this.tenantRepository,
    };
    return (await userMap[type].find(options)) as (T extends UserTypeEnum.tenant
      ? Tenant
      : Landlord)[];
  }
}
