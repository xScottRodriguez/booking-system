import { Injectable } from '@nestjs/common';

import { roles } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}
  getDefaultRole(defaultRole = 'AUTHENTICATED'): Promise<roles> {
    return this.prisma.roles.findUnique({
      where: {
        name: defaultRole,
      },
    });
  }

  getAll(): Promise<roles[]> {
    return this.prisma.roles.findMany();
  }

  getOne(id: number): Promise<roles> {
    return this.prisma.roles.findUnique({
      where: {
        id,
      },
    });
  }
}
