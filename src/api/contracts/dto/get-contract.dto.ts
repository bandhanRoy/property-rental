import { IsUUID } from 'class-validator';

export class GetSpecificContractParamDto {
  @IsUUID('4')
  id: string;
}
