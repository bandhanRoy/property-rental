import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { UserTokenPayload } from '../@types';
import { JwtUtil } from '../utils/jwt.util';
import { getLoggerPrefix } from '../utils/logger.util';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly jwtUtil: JwtUtil;
  constructor(private readonly configService: ConfigService) {
    this.jwtUtil = new JwtUtil(this.configService);
  }

  use(req: Request, _res: Response, next: NextFunction) {
    try {
      Logger.log(`${getLoggerPrefix()}: Inside function`);
      const token = req.headers.authorization.split(' ')[1];
      const decoded = this.jwtUtil.verify(token);
      if (!decoded)
        throw new UnauthorizedException('Not authorized to access endpoint');
      req['user'] = decoded['data'] as UserTokenPayload;
    } catch (error) {
      Logger.error(
        `${getLoggerPrefix()}: Error occurred while validating token ${error}`,
      );
      throw new UnauthorizedException('Not authorized to access endpoint');
    }
    next();
  }
}
