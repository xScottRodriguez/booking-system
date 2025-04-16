import { Injectable } from '@nestjs/common';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

import { Response } from 'express';
import { Observable, catchError, throwError } from 'rxjs';

import { DefultResponseDto } from '../dto/';

@Injectable()
export class ErrorFormatterInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<DefultResponseDto<null>> {
    return next.handle().pipe(
      /* eslint-disable @typescript-eslint/no-explicit-any */
      catchError((err: any, _caught: Observable<any>) => {
        const response: Response = context.switchToHttp().getResponse();
        const responseDto: DefultResponseDto<null> = {
          statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          data: null,
          errors: [],
        };

        if (err instanceof HttpException) {
          const responseBody = err.getResponse();
          const statusCode = err.getStatus();

          // Verificamos si responseBody es un objeto y contiene los campos esperados
          if (typeof responseBody === 'object' && responseBody !== null) {
            const message = (responseBody as { message: string | string[] })
              .message;
            const errors = (responseBody as { message: string[] }).message;

            responseDto.statuscode = statusCode;
            responseDto.message = Array.isArray(message)
              ? message.join(', ')
              : message;
            responseDto.errors = Array.isArray(errors) ? errors : [errors];
          } else {
            responseDto.message = responseBody as string; // Si el body no es un objeto, lo tratamos como mensaje
            responseDto.errors = [responseBody as string]; // Si no hay 'errors', usamos el mismo mensaje
          }
        }

        return throwError(() => response);
      }),
    );
  }
}
