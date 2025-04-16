import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { users } from '@prisma/client';
import { Roles } from '@root/src/common/enums';
import { RoleAuthGuard } from '@root/src/common/guards';

import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateStateBookingDto } from './dto/update-state-booking.dto';
import { GetUser } from '@/modules/auth/decorators/get-user.decorator';

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
  create(@Body() createBookingDto: CreateBookingDto): Promise<void> {
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
  @UseGuards(AuthGuard('jwt'), new RoleAuthGuard('ADMIN', 'AUTHENTICATED'))
  @Get()
  findAll(@GetUser() user: users): Promise<users[] | void> {
    return this.bookingService.findAll(user);
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
  @UseGuards(AuthGuard('jwt'), new RoleAuthGuard('ADMIN', 'AUTHENTICATED'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<void> {
    return this.bookingService.update(+id, updateBookingDto);
  }

  @Patch('/:id/update-states')
  updateStateBooking(
    @Param('id') id: string,
    @Body() updateStateBookingDto: UpdateStateBookingDto,
  ): Promise<void> {
    return this.bookingService.updateStateBooking(
      +id,
      updateStateBookingDto.stateId,
    );
  }

  @ApiOkResponse({
    description: 'Delete Booking',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error trying delete booking',
        error: 'InternalServerError',
      },
    },
  })
  @UseGuards(AuthGuard('jwt'), new RoleAuthGuard('ADMIN', 'AUTHENTICATED'))
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.bookingService.remove(+id);
  }
}
