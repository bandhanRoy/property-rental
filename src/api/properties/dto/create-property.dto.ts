import { IsNumber, IsString } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  address: string;

  @IsString()
  size: string;

  @IsString()
  description: string;

  @IsString()
  amenities: string;

  @IsNumber()
  rent_amount: number;
}
