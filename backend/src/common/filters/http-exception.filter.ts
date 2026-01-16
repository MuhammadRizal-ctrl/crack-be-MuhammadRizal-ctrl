import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Handle validation errors (BadRequestException with array of messages)
    if (
      status === HttpStatus.BAD_REQUEST &&
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const responseObj = exceptionResponse as any;
      
      // If it's a validation error with message array
      if (Array.isArray(responseObj.message)) {
        return response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: 'Validation failed',
          errors: responseObj.message,
        });
      }
      
      // If it's a single message
      if (responseObj.message) {
        return response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: responseObj.message,
        });
      }
    }

    // Handle other exceptions
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

