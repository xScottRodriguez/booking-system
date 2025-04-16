import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { Prisma, PrismaClient } from '@prisma/client';
import { WinstonLoggerService } from '@root/src/common/services/logger.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly _logger: WinstonLoggerService) {
    super();
  }
  async onModuleInit(): Promise<void> {
    this._logger.log('Connecting to the database', {
      context: PrismaService.name,
    });
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    this._logger.log('Disconnecting from the database', {
      context: PrismaService.name,
    });
    await this.$disconnect();
  }

  executeTransaction<T>(
    tx: Prisma.TransactionClient | undefined = undefined,
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    if (!callback) throw new Error('You must provide a callback function');
    if (tx) return callback(tx);
    return this.$transaction((tx: Prisma.TransactionClient) => callback(tx));
  }
}
