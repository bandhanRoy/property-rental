import { IsNumber, NotEquals, ValidateIf } from 'class-validator';

export class GetAllReservationQueryDto {
  @ValidateIf((_, v) => v !== undefined)
  @NotEquals(null)
  @IsNumber()
  perPage: number;

  @ValidateIf((_, v) => v !== undefined)
  @NotEquals(null)
  @IsNumber()
  page: number;
}
