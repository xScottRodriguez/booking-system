import { LoggerService, Injectable, Scope, Inject } from '@nestjs/common';

import { existsSync, mkdirSync } from 'fs';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable({ scope: Scope.TRANSIENT }) // Permite instancias únicas por clase
export class WinstonLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {
    if (!existsSync('logs')) {
      mkdirSync('logs');
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        this.formatPrinter(),
      ),
      transports: [
        // file on daily rotation (info only)
        new winston.transports.DailyRotateFile({
          dirname: 'logs',
          filename: `%DATE%-info.log`,
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            this.formatPrinter(),
          ),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: 30,
        }),

        // file on daily rotation (warn only)
        new winston.transports.DailyRotateFile({
          dirname: 'logs',

          filename: `%DATE%-warn.log`,
          level: 'warn',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            this.formatPrinter(),
          ),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: 30,
        }),

        // file on daily rotation (error only)
        new winston.transports.DailyRotateFile({
          dirname: 'logs',

          // %DATE will be replaced by the current date
          filename: `%DATE%-error.log`,
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            this.formatPrinter(),
          ),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: 30,
        }),
        // same for all levels
        new winston.transports.DailyRotateFile({
          dirname: 'logs',

          filename: `%DATE%-combined.log`,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            this.formatPrinter(),
          ),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: 10,
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.cli(),
            winston.format.splat(),
            winston.format.timestamp(),
            winston.format.colorize(),
            this.formatPrinter(),
          ),
        }),
      ],
    });
  }

  log(message: string, meta: unknown): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta: unknown): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta: unknown): void {
    this.logger.warn(message, meta);
  }
  private formatPrinter(): winston.Logform.Format {
    return winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? '|| ' + JSON.stringify(meta, null, 2) : ''}`;
    });
  }
}
