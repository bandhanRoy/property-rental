import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { JwtUtil } from '../../utils/jwt.util';
import { getLoggerPrefix } from '../../utils/logger.util';
import { User } from '../users/entities/user.entity';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { Authentication } from './entities/authentication.entity';

@Injectable()
export class AuthenticationService {
  private readonly jwtUtil: JwtUtil;
  constructor(
    @InjectRepository(Authentication)
    private readonly authenticationRepository: Repository<Authentication>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.jwtUtil = new JwtUtil(this.configService);
  }

  async create(
    createAuthenticationDto: CreateAuthenticationDto,
  ): Promise<{ expiresIn: number; token: string }> {
    Logger.log(`${getLoggerPrefix()}: Inside function`);
    const user = await this.dataSource.getRepository(User).findOne({
      where: { username: createAuthenticationDto.username },
      relations: {
        tenant: true,
        landlord: true,
      },
      select: {
        id: true,
        username: true,
        password: true,
        tenant: { id: true },
        landlord: { id: true },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    // match the password
    const isMatched = await bcrypt.compare(
      createAuthenticationDto.password,
      user.password,
    );
    if (!isMatched)
      throw new UnauthorizedException('Password or email is incorrect');
    const auth = new Authentication();
    auth.user = user;
    const saved = await this.authenticationRepository.save(auth);
    if (!saved) {
      Logger.warn(
        `${getLoggerPrefix()}: Failed to save auth entry for an user`,
      );
      throw new InternalServerErrorException(
        'Something went wrong while generating token',
      );
    }

    const expiresIn =
      Math.floor(Date.now() / 1000) +
      60 * 60 * +this.configService.get('JWT_EXPIRATION');

    return {
      expiresIn,
      token: this.jwtUtil.signIn(expiresIn, {
        userId: user.id,
        authId: auth.id,
        tenant: user?.tenant?.id || null,
        landlord: user?.landlord?.id || null,
        username: user.username,
      }),
    };
  }

  findAll() {
    return `This action returns all authentication`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authentication`;
  }

  remove(id: number) {
    return `This action removes a #${id} authentication`;
  }
}
