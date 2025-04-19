import { existsSync, mkdirSync } from 'fs';

import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logDir = 'logs';

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}
const formatPrinter = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? '| ' + JSON.stringify(meta) : ''}`;
  },
);
export const winstonConfig: WinstonModuleOptions = {
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    // file on daily rotation (info only)
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: `%DATE%-info.log`,
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        formatPrinter,
      ),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: 30,
    }),

    // file on daily rotation (warn only)
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: `%DATE%-warn.log`,
      level: 'warn',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        formatPrinter,
      ),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: 30,
    }),

    // file on daily rotation (error only)
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: `%DATE%-error.log`,
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        formatPrinter,
      ),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: 30,
    }),

    // all levels combined
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: `%DATE%-combined.log`,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        formatPrinter,
      ),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: 10,
    }),

    // console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.cli(),
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.colorize(),
        formatPrinter,
      ),
    }),
  ],
};
