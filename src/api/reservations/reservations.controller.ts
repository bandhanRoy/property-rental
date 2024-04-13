import {
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { TransformResponseInterceptor } from '../../interceptors/response.interceptor';
import { ApproveReservationParamsDto } from './dto/approve-reservation.dto';
import { SuccessResponseType } from '../../@types';
import { RejectReservationParamsDto } from './dto/reject-reservation.dto';
import { Roles } from '../../decorators/role.decorator';
import { UserTypeEnum } from '../../enums/user.enum';
import { RoleGuard } from '../../guards/role.guard';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post(':id/approve')
  @Roles([UserTypeEnum.landlord])
  @UseGuards(RoleGuard)
  @UseInterceptors(TransformResponseInterceptor)
  async approveReservation(
    @Param() params: ApproveReservationParamsDto,
  ): Promise<SuccessResponseType<null>> {
    await this.reservationsService.approveReservation(params.id);
    return { message: 'Approved Successfully', data: null };
  }

  @Delete(':id/reject')
  @Roles([UserTypeEnum.landlord])
  @UseGuards(RoleGuard)
  async rejectReservation(@Param() params: RejectReservationParamsDto) {
    await this.reservationsService.approveReservation(params.id);
    return { message: 'Rejected Successfully', data: null };
  }
}
