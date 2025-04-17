import { Injectable } from '@nestjs/common';

import { Reservation, ReservationStatus } from '@prisma/client';
import * as luxon from 'luxon';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { ReservationsWithServices } from '../types';

@Injectable()
export class ReservationRepository {
  constructor(private readonly _prisma: PrismaService) {}
  findOfTheDay(date: string): Promise<ReservationsWithServices[]> {
    const exactDate = luxon.DateTime.fromISO(date).toJSDate();
    return this._prisma.reservation.findMany({
      where: {
        reservationDate: {
          equals: exactDate,
        },
      },
      include: {
        serviceType: {
          select: {
            unitsRequired: true,
            name: true,
          },
        },
      },
    });
  }

  create(createBookingDto: CreateBookingDto): Promise<Reservation> {
    const { serviceTypeId, date, clientId } = createBookingDto;

    const reservationDate: Date = luxon.DateTime.fromISO(date).toJSDate();
    return this._prisma.reservation.create({
      data: {
        serviceTypeId: serviceTypeId,
        clientId: clientId,
        status: ReservationStatus.confirmada,
        reservationDate: reservationDate,
        scheduledTime: reservationDate,
      },
    });
  }
}
