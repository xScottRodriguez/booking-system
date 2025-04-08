import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";


import { CreateAuthDto } from '../dto'
import { randomUUID } from "crypto";
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) { }


  create(createUser: CreateAuthDto, role: number) {
    this.prisma.users.create({
      data: {
        username: createUser.username,
        email: createUser.email,
        activationToken: randomUUID(),
        password: createUser.password,
        roleId: role
      }
    })
  }
  findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: {
        email
      },
      include: {
        roles: true
      }
    })
  }

  findOneInactiveByActivationToken(activationToken: string, id: number) {
    return this.prisma.users.findUnique({
      where: {
        activationToken,
        isActive: false,
        id
      }
    })
  }

  findOneByResetPasswordToken(token: string) {
    return this.prisma.users.findUnique({
      where: {
        resetPasswordToken: token
      }
    })
  }
  findOneById(id: number) {
    return this.prisma.users.findUnique({
      where: {
        id
      }
    })
  }


}
