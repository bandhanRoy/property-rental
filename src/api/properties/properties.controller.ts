import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  PaginatedSuccessResponseType,
  SuccessResponseType,
  UserTokenPayload,
} from '../../@types';
import { ExtractKeyFromRequest } from '../../decorators/custom-request-data.decorator';
import { TransformResponseInterceptor } from '../../interceptors/response.interceptor';
import { CreatePropertyDto } from './dto/create-property.dto';
import {
  CreateReservationBodyDto,
  CreateReservationParamsDto,
} from './dto/create-reservation.dto';
import { GetAllReservationQueryDto } from './dto/get-all-reservation.dto';
import { Property } from './entities/property.entity';
import { PropertiesService } from './properties.service';
import { Roles } from '../../decorators/role.decorator';
import { UserTypeEnum } from '../../enums/user.enum';
import { RoleGuard } from '../../guards/role.guard';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Roles([UserTypeEnum.landlord])
  @UseGuards(RoleGuard)
  @UseInterceptors(TransformResponseInterceptor)
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @ExtractKeyFromRequest('user') user: UserTokenPayload,
  ): Promise<SuccessResponseType<string>> {
    const data = await this.propertiesService.create(
      createPropertyDto,
      user.landlord,
    );
    return { message: 'Property saved successfully', data };
  }

  @Post(':id/reserve')
  @Roles([UserTypeEnum.tenant])
  @UseGuards(RoleGuard)
  @UseInterceptors(TransformResponseInterceptor)
  async reserveProperty(
    @Body() createReservationDto: CreateReservationBodyDto,
    @Param() params: CreateReservationParamsDto,
    @ExtractKeyFromRequest('user') user: UserTokenPayload,
  ): Promise<SuccessResponseType<string>> {
    const data = await this.propertiesService.createReservation(
      params.id,
      user.tenant,
      createReservationDto,
    );
    return { message: 'Property reserved successfully', data };
  }

  @Post(':id/reserve')
  @UseInterceptors(TransformResponseInterceptor)
  async getProperty(
    @Param() params: CreateReservationParamsDto,
  ): Promise<SuccessResponseType<Property>> {
    const data = await this.propertiesService.getProperty(params.id);
    return { message: 'Property fetched successfully', data };
  }

  @Get()
  @UseInterceptors(TransformResponseInterceptor)
  async getAllProperties(
    @ExtractKeyFromRequest('user') user: UserTokenPayload,
    @Query() query: GetAllReservationQueryDto,
  ): Promise<PaginatedSuccessResponseType<Property[]>> {
    const page = query.page || 1;
    const perPage = query.perPage || 10;
    const skip = perPage * page - perPage;
    const data = await this.propertiesService.getAllProperties(
      user.tenant,
      user.landlord,
      perPage,
      skip,
    );
    return {
      message: 'Property fetched successfully',
      data,
      info: { page, perPage },
    };
  }
}
