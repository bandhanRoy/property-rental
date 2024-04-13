import { IsUUID } from 'class-validator';

export class DeleteContractParamDto {
  @IsUUID('4')
  id: string;
}
