import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Reservation } from '@prisma/client';
import { DefultResponseDto } from '@root/src/common/dto';
import { Roles } from '@root/src/common/enums';
import { RoleAuthGuard } from '@root/src/common/guards';
import { PaginationQueryDto } from '@root/src/common/interfaces';
import { IPagination } from '@root/src/common/interfaces/pagination.interface';
import { parsePagination } from '@root/src/common/utils';

import { CreateBookingDto, FiltersDto, UpdateStateBookingDto } from './dto';
import { BookingService } from './services';

@ApiTags('Bookings')
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiCreatedResponse({
    description: 'Booking Created',
  })
  @ApiConflictResponse({
    schema: {
      example: {
        statusCode: 409,
        message:
          'A reservation already exists for the time you are trying to book',
        error: 'ConflicException',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error trying create booking',
        error: 'InternalServerError',
      },
    },
  })
  @UseGuards(
    AuthGuard('jwt'),
    new RoleAuthGuard(Roles.ADMIN, Roles.AUTHENTICATED),
  )
  @Post()
  create(
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<DefultResponseDto<Reservation>> {
    return this.bookingService.create(createBookingDto);
  }

  @ApiOkResponse({
    description: 'List bookings',
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error trying find bookings',
        error: 'InternalServerError',
      },
    },
  })
  @UseGuards(
    AuthGuard('jwt'),
    new RoleAuthGuard(Roles.ADMIN, Roles.AUTHENTICATED),
  )
  @Get()
  findAll(
    @Query() pagination: PaginationQueryDto<FiltersDto>,
  ): Promise<IPagination<Reservation>> {
    const paginationParsed = parsePagination(pagination);
    return this.bookingService.findAll(paginationParsed);
  }

  @ApiOkResponse({
    description: 'update booking',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error trying update booking',
        error: 'InternalServerError',
      },
    },
  })
  @ApiConflictResponse({
    schema: {
      example: {
        statusCode: 409,
        message:
          'A reservation already exists for the time you are trying to book',
        error: 'ConflicException',
      },
    },
  })
  @ApiBody({
    type: UpdateStateBookingDto,
    description: 'Update booking status',
  })
  @UseGuards(AuthGuard('jwt'), new RoleAuthGuard('ADMIN', 'AUTHENTICATED'))
  @Patch('/:id/change-status')
  updateStateBooking(
    @Param('id') id: string,
    @Body() updateStateBookingDto: UpdateStateBookingDto,
  ): Promise<Reservation> {
    return this.bookingService.changeStatus(+id, updateStateBookingDto.stateId);
  }
}
