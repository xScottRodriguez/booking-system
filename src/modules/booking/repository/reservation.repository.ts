import { Injectable } from '@nestjs/common';

import { Prisma, Reservation, ReservationStatus } from '@prisma/client';
import { OrderType } from '@root/src/common/enums';
import { PaginationQueryDto } from '@root/src/common/interfaces';
import { IPagination } from '@root/src/common/interfaces/pagination.interface';
import pageBuilder from '@root/src/common/utils/page-builder';
import { DateTime } from 'luxon';

import { PrismaService } from '../../prisma/prisma.service';
import { FiltersDto } from '../dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { ReservationsWithServices } from '../types';

@Injectable()
export class ReservationRepository {
  constructor(private readonly _prisma: PrismaService) {}
  findOfTheDay(
    date: string,
    hour: string,
  ): Promise<ReservationsWithServices[]> {
    const reservationDate = DateTime.fromISO(date).toFormat('yyyy-MM-dd');
    return this._prisma.reservation.findMany({
      where: {
        reservationDate: reservationDate,
        scheduledTime: hour,
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
    const { serviceTypeId, date, clientId, hour } = createBookingDto;

    return this._prisma.reservation.create({
      data: {
        serviceTypeId: serviceTypeId,
        clientId: clientId,
        status: ReservationStatus.confirmada,
        reservationDate: date,
        scheduledTime: hour,
      },
    });
  }

  findAll(
    pagination: PaginationQueryDto<FiltersDto>,
  ): Promise<IPagination<Reservation>> {
    const { page, limit, filters } = pagination;

    const where: Prisma.ReservationWhereInput = {};

    if (filters?.fromDate && filters?.toDate) {
      where.reservationDate = {
        gte: filters.fromDate,
        lt: filters.toDate,
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

    console.log({ where });

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
