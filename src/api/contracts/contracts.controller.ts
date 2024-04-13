import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { TransformResponseInterceptor } from '../../interceptors/response.interceptor';
import { SuccessResponseType, UserTokenPayload } from '../../@types';
import { GetSpecificContractParamDto } from './dto/get-contract.dto';
import { Contract } from './entities/contract.entity';
import { DeleteContractParamDto } from './dto/delete-contract.dto';
import {
  RequestContractTerminationBodyDto,
  RequestContractTerminationParamsDto,
} from './dto/request-contract-termination.dto';
import { ExtractKeyFromRequest } from '../../decorators/custom-request-data.decorator';
import {
  UpdateContractBodyDto,
  UpdateContractParamDto,
} from './dto/update-contract.dto';
import { Roles } from '../../decorators/role.decorator';
import { UserTypeEnum } from '../../enums/user.enum';
import { RoleGuard } from '../../guards/role.guard';
import { CreateTermsDto } from './dto/create-terms.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @Roles([UserTypeEnum.landlord])
  @UseGuards(RoleGuard)
  @UseInterceptors(TransformResponseInterceptor)
  async create(
    @Body() createContractDto: CreateContractDto,
  ): Promise<SuccessResponseType<string>> {
    const data = await this.contractsService.create(createContractDto);
    return { message: 'Contract successfully created', data };
  }

  @Post('terms')
  @Roles([UserTypeEnum.landlord])
  @UseGuards(RoleGuard)
  @UseInterceptors(TransformResponseInterceptor)
  async createTerms(
    @Body() createTermsDto: CreateTermsDto,
  ): Promise<SuccessResponseType<string>> {
    const data = await this.contractsService.createTerms(createTermsDto);
    return { message: 'Terms successfully created', data };
  }

  @Get(':id')
  @UseInterceptors(TransformResponseInterceptor)
  async findOne(
    @Param() params: GetSpecificContractParamDto,
  ): Promise<SuccessResponseType<Contract>> {
    // get specific contract
    const data = await this.contractsService.findOne(params.id);
    return { data };
  }

  @Patch(':id')
  @Roles([UserTypeEnum.landlord])
  @UseGuards(RoleGuard)
  @UseInterceptors(TransformResponseInterceptor)
  async update(
    @Param() params: UpdateContractParamDto,
    @Body() updateContractDto: UpdateContractBodyDto,
    @ExtractKeyFromRequest('user') user: UserTokenPayload,
  ): Promise<SuccessResponseType<null>> {
    // modify contract term
    await this.contractsService.update(
      params.id,
      user.landlord,
      updateContractDto,
    );
    return { message: 'Contract update successfully', data: null };
  }

  @Delete(':id')
  @Roles([UserTypeEnum.landlord])
  @UseGuards(RoleGuard)
  @UseInterceptors(TransformResponseInterceptor)
  async remove(
    @Param() param: DeleteContractParamDto,
    @ExtractKeyFromRequest('user') user: UserTokenPayload,
  ): Promise<SuccessResponseType<null>> {
    // terminate contract
    await this.contractsService.remove(param.id, user.landlord);
    return { message: 'Successfully deleted contract', data: null };
  }

  @Post(':id/terminate')
  @UseInterceptors(TransformResponseInterceptor)
  async requestContractTermination(
    @Param() param: RequestContractTerminationParamsDto,
    @Body() body: RequestContractTerminationBodyDto,
    @ExtractKeyFromRequest('user') user: UserTokenPayload,
  ): Promise<SuccessResponseType<string>> {
    const data = await this.contractsService.terminationRequest(
      param.id,
      user.landlord,
      user.tenant,
      body,
    );
    return { message: 'Terminated request created successfully', data };
  }
}
