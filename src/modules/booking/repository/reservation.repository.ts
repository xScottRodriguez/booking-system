import { Injectable } from '@nestjs/common';

import { Prisma, Reservation, ReservationStatus } from '@prisma/client';
import { OrderType } from '@root/src/common/enums';
import { PaginationQueryDto } from '@root/src/common/interfaces';
import { IPagination } from '@root/src/common/interfaces/pagination.interface';
import pageBuilder from '@root/src/common/utils/page-builder';
import * as luxon from 'luxon';

import { PrismaService } from '../../prisma/prisma.service';
import { FiltersDto } from '../dto';
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

  findAll(
    pagination: PaginationQueryDto<FiltersDto>,
  ): Promise<IPagination<Reservation>> {
    const { page, limit, filters } = pagination;

    const where: Prisma.ReservationWhereInput = {};

    if (filters?.fromDate) {
      where.reservationDate = {
        gte: luxon.DateTime.fromISO(filters.fromDate).toJSDate(),
      };
    }

    if (filters?.toDate) {
      where.reservationDate = {
        lte: luxon.DateTime.fromISO(filters.toDate).toJSDate(),
      };
    }

    if (filters?.serviceTypeId) {
      where.serviceTypeId = +filters.serviceTypeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.clientId) {
      where.clientId = +filters.clientId;
    }

    return pageBuilder<
      Reservation,
      Prisma.ReservationSelect,
      Prisma.ReservationWhereInput,
      Prisma.ReservationOrderByWithRelationInput,
      Prisma.ReservationInclude
    >(this._prisma.reservation, {
      where,
      include: {
        serviceType: true,
        client: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      limit,
      page,
      orderBy: {
        reservationDate: OrderType.ASC,
      },
    });
  }
}
