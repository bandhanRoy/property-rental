import { IsString } from 'class-validator';

export class GetPropertyParamsDto {
  @IsString()
  id: string;
}
