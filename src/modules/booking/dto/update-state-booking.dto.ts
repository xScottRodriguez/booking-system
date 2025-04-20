import { ReservationStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStateBookingDto {
  @IsNotEmpty()
  @IsEnum(ReservationStatus)
  stateId: ReservationStatus;
}
