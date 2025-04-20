import { ApiProperty } from '@nestjs/swagger';

import { ReservationStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

import { CreateBookingDto } from './create-booking.dto';

export class UpdateBookingDto extends CreateBookingDto {
  @ApiProperty({
    example: 1,
  })
  @IsEnum(ReservationStatus)
  stateId?: ReservationStatus;
}
