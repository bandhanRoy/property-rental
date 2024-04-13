import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  MinDate,
} from 'class-validator';
import { IsAfter } from '../../../decorators/is-date-after.decorator';

export class CreateContractDto {
  @IsUUID('4')
  property_id: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  start_date: Date;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  @IsAfter('start_date')
  end_date: Date;

  @IsNumber()
  rent_amount: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  tenants: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  terms: string[];
}
