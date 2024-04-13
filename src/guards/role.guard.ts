import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Roles } from '../decorators/role.decorator';
import { UserTypeEnum } from '../enums/user.enum';
import { getLoggerPrefix } from '../utils/logger.util';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserTypeEnum[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      Logger.log(
        `${getLoggerPrefix()}: Role not defined for the route but guard was added to this route`,
      );
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user;
    if (roles.some((role) => user[role] === null)) {
      Logger.log(`${getLoggerPrefix()}: Role mismatch`);
      throw new ForbiddenException('Not authorized to access endpoint');
    }
    return true;
  }
}
