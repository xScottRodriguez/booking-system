import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';

import { HttpStatusMessages } from '../constans/';
import { DefultResponseDto } from '../dto';

@Injectable()
export class ResponseService {
  sanitize<T>(
    data: T,
    message: string[] = [HttpStatusMessages[HttpStatus.OK]],
    statusCode: number = HttpStatus.OK,
  ): DefultResponseDto<T> {
    return {
      statuscode: statusCode,
      message: message,
      data: data || null,
      errors: null,
    };
  }

  error<T>(
    message: string[] | string = [
      HttpStatusMessages[HttpStatus.INTERNAL_SERVER_ERROR],
    ],
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errors: string[] | string | null = null,
  ): DefultResponseDto<T> {
    return {
      statuscode: statusCode,
      message: message,
      data: null,
      errors: errors,
    };
  }
}
