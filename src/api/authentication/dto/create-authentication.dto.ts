import { IsString } from 'class-validator';

export class CreateAuthenticationDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
