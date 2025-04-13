import { Injectable } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { users } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuthDto } from '../dto';
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(createUser: CreateAuthDto, role: number): Promise<users> {
    return this.prisma.users.create({
      data: {
        username: createUser.username,
        email: createUser.email,
        activationToken: randomUUID(),
        password: createUser.password,
        roleId: role,
      },
    });
  }
  findByEmail(email: string): Promise<users> {
    return this.prisma.users.findUnique({
      where: {
        email,
      },
      include: {
        roles: true,
      },
    });
  }

  findOneInactiveByActivationToken(
    activationToken: string,
    id: number,
  ): Promise<users> {
    return this.prisma.users.findUnique({
      where: {
        activationToken,
        isActive: false,
        id,
      },
    });
  }

  findOneByResetPasswordToken(token: string): Promise<users> {
    return this.prisma.users.findUnique({
      where: {
        resetPasswordToken: token,
      },
    });
  }
  findOneById(id: number): Promise<users> {
    return this.prisma.users.findUnique({
      where: {
        id,
      },
    });
  }

  findOneByIdAndActivationtokenAndIsActive(
    id: number,
    activationToken: string,
  ): Promise<users> {
    return this.prisma.users.findUnique({
      where: {
        id,
        activationToken,
        isActive: false,
      },
    });
  }

  updateUser(id: number, data: Partial<users>): Promise<user> {
    return this.prisma.users.update({
      where: {
        id,
      },
      data,
    });
  }

  // subscribeUserToNotification(token: string, userId: number) {
  //   return this.prisma.users.update({
  //     where: {
  //       id: userId
  //     },
  //     data: {
  //       notificationToken: token
  //     }
  //   })
  // }

  // checkUserNotificationToken(token: string, userId: number) {
  //   return this.prisma.users.findUnique({
  //     where: {
  //       id: userId,
  //       notificationToken: token
  //     }
  //   })
  // }
}
