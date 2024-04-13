import { IsUUID } from 'class-validator';

export class ApproveReservationParamsDto {
  @IsUUID('4')
  id: string;
}
