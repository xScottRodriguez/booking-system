import { Module } from '@nestjs/common';

import { winstonConfig } from '@common/config';
import { WinstonLoggerService } from '@common/services';
import { WinstonModule } from 'nest-winston';
@Module({
  imports: [WinstonModule.forRoot(winstonConfig)],
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class LoggerModule {}
