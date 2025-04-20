import { Injectable } from '@nestjs/common';

import { Prisma, ServiceType } from '@prisma/client';
import { OrderType } from '@root/src/common/enums';
import { PaginationQueryDto } from '@root/src/common/interfaces';
import { IPagination } from '@root/src/common/interfaces/pagination.interface';
import pageBuilder from '@root/src/common/utils/page-builder';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(
    pagination: PaginationQueryDto<{ name: string }>,
  ): Promise<IPagination<ServiceType>> {
    const { page, limit, filters } = pagination;

    const where: Prisma.ServiceTypeWhereInput = {};

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    return pageBuilder<
      ServiceType,
      Prisma.ServiceTypeSelect,
      Prisma.ServiceTypeWhereInput,
      Prisma.ServiceTypeOrderByWithRelationInput,
      Prisma.ServiceTypeInclude
    >(this.prisma.serviceType, {
      where,
      orderBy: {
        name: OrderType.ASC,
      },
      page,
      limit,
    });
  }
}
