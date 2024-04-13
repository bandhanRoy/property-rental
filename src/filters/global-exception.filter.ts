import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { getLoggerPrefix } from '../utils/logger.util';

@Catch()
export class GlobalExceptionHandler implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error occurred';
    const request = ctx.getRequest();

    let errors = null;
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus() as HttpStatus;
      message = exception.message || exception.message?.['error'];
      errors = exception.getResponse()?.['message'] || null;
    }
    let responseBody = exception['response'];
    if (!(exception instanceof ServiceUnavailableException)) {
      // service unavailable exception is thrown by health check only
      responseBody = {
        statusCode: httpStatus,
        message,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(request),
        requestId: request.requestId,
        sessionId: request.sessionId,
        errors,
      };
    }

    Logger.error(
      `${getLoggerPrefix()} Error occurred details: ${JSON.stringify({
        method: request.method,
        url: request.originalUrl,
        formattedErrResponse: responseBody,
        errStack: exception?.['stack'],
        errorResponse: exception['response'],
      })}`,
    );
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
