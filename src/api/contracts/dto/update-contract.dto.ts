import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateContractDto } from './create-contract.dto';
import {
  IsArray,
  IsUUID,
  NotEquals,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ArrayOfUUIDsUpdateDto {
  @IsArray()
  @IsUUID('4', { each: true })
  remove: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  add: string[];
}

export class UpdateContractBodyDto extends PartialType(
  OmitType(CreateContractDto, [
    'start_date',
    'tenants',
    'terms',
    'property_id',
  ]),
) {
  @ValidateIf((_, o) => o !== undefined)
  @NotEquals(null)
  @ValidateNested({ each: true })
  @Type(() => ArrayOfUUIDsUpdateDto)
  terms: ArrayOfUUIDsUpdateDto;

  @ValidateIf((_, o) => o !== undefined)
  @NotEquals(null)
  @ValidateNested({ each: true })
  @Type(() => ArrayOfUUIDsUpdateDto)
  tenants: ArrayOfUUIDsUpdateDto;
}

export class UpdateContractParamDto {
  @IsUUID('4')
  id: string;
}
