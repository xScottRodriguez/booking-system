import { Injectable } from '@nestjs/common';

import * as luxon from 'luxon';

import { PrismaService } from '../../prisma/prisma.service';
import { ReservationsWithServices } from '../types';

@Injectable()
export class ReservationRepository {
  constructor(private readonly _prisma: PrismaService) {}
  findOfTheDay(date: string): Promise<ReservationsWithServices[]> {
    return this._prisma.reservation.findMany({
      where: {
        reservationDate: {
          equals: luxon.DateTime.fromISO(date).toFormat('yyyy-MM-dd'),
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
}
