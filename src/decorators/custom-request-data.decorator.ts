import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ExtractKeyFromRequest = createParamDecorator(
  (data: keyof Request, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request?.[data];
  },
);
