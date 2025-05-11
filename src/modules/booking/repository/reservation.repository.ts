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
    hour?: string,
  ): Promise<ReservationsWithServices[]> {
    const reservationDate = DateTime.fromISO(date).toFormat('yyyy-MM-dd');

    const where: Prisma.ReservationWhereInput = {
      reservationDate: reservationDate,
    };

    if (hour) {
      where.scheduledTime = hour;
    }

    return this._prisma.reservation.findMany({
      where: where,
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
    const { serviceTypeId, date, hour, clientId } = createBookingDto;

    return this._prisma.reservation.create({
      data: {
        serviceTypeId: serviceTypeId,
        status: ReservationStatus.confirmada,
        reservationDate: date,
        scheduledTime: hour,
        clientId: clientId,
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
        lte: filters.toDate,
      };
    }

    if (filters?.serviceType) {
      where.serviceType = {
        name: filters?.serviceType,
      };
      // where.serviceTypeId = +filters.serviceTypeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.client) {
      where.client = {
        username: {
          contains: filters.client,
          mode: 'insensitive',
        },
      };
    }
    if (filters?.clientPhone) {
      where.client = {
        phone: {
          contains: filters.clientPhone,
          mode: 'insensitive',
        },
      };
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
      },
      limit,
      page,
      orderBy: {
        reservationDate: OrderType.ASC,
      },
    });
  }

  changeStatus(
    reservationId: number,
    statusId: ReservationStatus,
  ): Promise<Reservation> {
    return this._prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: statusId,
      },
    });
  }
}
