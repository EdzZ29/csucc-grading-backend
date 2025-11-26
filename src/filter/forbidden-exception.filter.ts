import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode: status,
      error: 'Internal Server Error',
      message: 'Something went wrong',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorResponse = {
          statusCode: status,
          error: HttpStatus[status] || 'Error',
          message: exceptionResponse,
        };
      } else {
        errorResponse = {
          statusCode: status,
          error: HttpStatus[status] || 'Error',
          ...(exceptionResponse as object),
        };
      }
    }

    response.status(status).json(errorResponse);
  }
}
