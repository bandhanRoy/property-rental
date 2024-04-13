import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTermsDto {
  @IsString()
  @IsNotEmpty()
  term: string;
}
