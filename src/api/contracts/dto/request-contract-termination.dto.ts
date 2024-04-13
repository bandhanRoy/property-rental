import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsUUID, MinDate } from 'class-validator';

export class RequestContractTerminationBodyDto {
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  request_termination_date: Date;
}

export class RequestContractTerminationParamsDto {
  @IsUUID('4')
  id: string;
}
