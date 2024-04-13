import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserTokenPayload } from '../@types';

export class JwtUtil {
  constructor(private readonly configService: ConfigService) {}

  signIn(expiresIn: number, payload: UserTokenPayload) {
    return jwt.sign(
      {
        exp: expiresIn,
        data: payload,
      },
      this.configService.get('JWT_SECRET'),
    );
  }

  verify(token: string) {
    return jwt.verify(token, this.configService.get('JWT_SECRET'));
  }
}
