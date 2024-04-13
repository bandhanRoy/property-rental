import { Reflector } from '@nestjs/core';
import { UserTypeEnum } from '../enums/user.enum';

export const Roles = Reflector.createDecorator<UserTypeEnum[]>();
