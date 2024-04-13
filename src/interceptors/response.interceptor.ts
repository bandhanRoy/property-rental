import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedSuccessResponseType, SuccessResponseType } from 'src/@types';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponseType<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponseType<T> | PaginatedSuccessResponseType<T>> {
    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: data.message || 'Success.',
          data: data.data,
          info: data.info,
        };
      }),
    );
  }
}
