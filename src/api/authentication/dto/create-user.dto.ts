import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { USER_REGISTRATION_LIMIT } from '../../../constants/user.constant';
import { IsUnique } from '../../../decorators/is-unique.decorator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  @IsUnique({ tableName: 'user', column: 'username' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(USER_REGISTRATION_LIMIT.MIN_PASSWORD_LENGTH)
  @MaxLength(USER_REGISTRATION_LIMIT.MAX_PASSWORD_LENGTH)
  @Matches(USER_REGISTRATION_LIMIT.PASSWORD_REGEX)
  password: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  landlord: boolean;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  tenant: boolean;
}
