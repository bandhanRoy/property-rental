import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, MinDate } from 'class-validator';

export class CreateReservationBodyDto {
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  desired_move_in_date: Date;
}

export class CreateReservationParamsDto {
  @IsString()
  id: string;
}
