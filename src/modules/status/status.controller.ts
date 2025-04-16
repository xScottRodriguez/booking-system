import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from '@root/src/common/enums';
import { RoleAuthGuard } from '@root/src/common/guards';

import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { StatusService } from './status.service';

@ApiTags('States')
@ApiBearerAuth()
@Controller('states')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @ApiCreatedResponse({
    description: 'state Created',
  })
  @ApiConflictResponse({
    schema: {
      example: {
        statusCode: 409,
        message: 'This state is already registered',
        error: 'ConflictException',
      },
    },
    description: 'Conflict Exception',
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
        statusCode: 404,
        message: 'Forbbiden Role',
        error: 'ForbbidenException',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error trying create state',
        error: 'InternalServerError',
      },
    },
  })
  @UseGuards(AuthGuard('jwt'), new RoleAuthGuard(Roles.ADMIN))
  @Post()
  create(@Body() createStatusDto: CreateStatusDto): Promise<void> {
    return this.statusService.create(createStatusDto);
  }

  @ApiOkResponse({
    description: 'state Created',
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
        message: 'Error trying find state',
        error: 'InternalServerError',
      },
    },
  })
  @UseGuards(
    AuthGuard('jwt'),
    new RoleAuthGuard(Roles.ADMIN, Roles.AUTHENTICATED),
  )
  @Get()
  findAll(): Promise<void> {
    return this.statusService.findAll();
  }

  @ApiOkResponse({
    description: 'state Created',
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
        statusCode: 404,
        message: 'Forbbiden Role',
        error: 'ForbbidenException',
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'State not found',
        error: 'NotFoundException',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal Server Error',
        error: 'InternalServerError',
      },
    },
  })
  @UseGuards(
    AuthGuard('jwt'),
    new RoleAuthGuard(Roles.ADMIN, Roles.AUTHENTICATED),
  )
  @Get(':id')
  findOne(@Param('id') id: string): Promise<void> {
    return this.statusService.findOne(+id);
  }

  @ApiOkResponse({
    description: 'state Updated',
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
        statusCode: 404,
        message: 'Forbbiden Role',
        error: 'ForbbidenException',
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'State not found',
        error: 'NotFoundException',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error trying update service',
        error: 'InternalServerError',
      },
    },
  })
  @UseGuards(AuthGuard('jwt'), new RoleAuthGuard(Roles.ADMIN))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<void> {
    return this.statusService.update(+id, updateStatusDto);
  }

  @ApiOkResponse({
    description: 'state Deleted',
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
        statusCode: 404,
        message: 'Forbbiden Role',
        error: 'ForbbidenException',
      },
    },
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'State not found',
        error: 'NotFoundException',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error trying delete service',
        error: 'InternalServerError',
      },
    },
  })
  @UseGuards(AuthGuard('jwt'), new RoleAuthGuard(Roles.ADMIN))
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.statusService.remove(+id);
  }
}
