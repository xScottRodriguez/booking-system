import { Injectable } from '@nestjs/common';

import { ServiceType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ServiceRepository {
  constructor(private readonly _prisma: PrismaService) {}

  findById(id: number): Promise<ServiceType> {
    return this._prisma.serviceType.findUnique({
      where: {
        id,
      },
    });
  }
}
