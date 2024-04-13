import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { TransformResponseInterceptor } from '../../interceptors/response.interceptor';
import { SuccessResponseType } from '../../@types';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UsersService,
  ) {}

  @Post('sign-in')
  @UseInterceptors(TransformResponseInterceptor)
  async create(
    @Body() createAuthenticationDto: CreateAuthenticationDto,
  ): Promise<SuccessResponseType<{ expiresIn: number; token: string }>> {
    const data = await this.authenticationService.create(
      createAuthenticationDto,
    );
    return { message: 'Sign in successful', data };
  }

  @Post('sign-up')
  @UseInterceptors(TransformResponseInterceptor)
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SuccessResponseType<boolean>> {
    const data = await this.userService.create(createUserDto);
    return { message: 'Successfully created user', data };
  }
}
