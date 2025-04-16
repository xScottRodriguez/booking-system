import { Injectable } from '@nestjs/common';

import { GlobalScheduleConfig } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GlobalScheduleConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  getGlobalScheduleConfig(): Promise<GlobalScheduleConfig> {
    return this.prisma.globalScheduleConfig.findFirst({
      where: {
        id: 1, //INFO: unic register
      },
    });
  }
}
