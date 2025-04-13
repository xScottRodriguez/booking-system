import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { roles } from '@prisma/client';

import { RoleService } from './role.service';
import { RoleAuthGuard } from '@/guards/role-auth/role-auth.guard';

@ApiBearerAuth()
@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOkResponse({
    description: 'List Roles',
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error trying find role',
        error: 'InternalServerError',
      },
    },
  })
  @UseGuards(new RoleAuthGuard('ADMIN', 'AUTHENTICATED'))
  @Get()
  async find(): Promise<roles[]> {
    return this.roleService.getAll();
  }

  @ApiOkResponse({
    description: 'list a Role',
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbbiden Role',
        error: 'ForbbidenException',
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'Role Not Foud',
        error: 'NotFoundException',
      },
    },
  })
  @UseGuards(new RoleAuthGuard('ADMIN', 'AUTHENTICATED'))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<roles> {
    return this.roleService.getOne(+id);
  }
}
