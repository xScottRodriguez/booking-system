import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Reservation, ReservationStatus } from '@prisma/client';
import { DefultResponseDto } from '@root/src/common/dto';
import { PaginationQueryDto } from '@root/src/common/interfaces';
import { IPagination } from '@root/src/common/interfaces/pagination.interface';
import {
  ResponseService,
  WinstonLoggerService,
} from '@root/src/common/services';
import { getHours, minutesToTime, timeToMinutes } from '@root/src/common/utils';
import { HttpStatusCode } from 'axios';

import { DailyCapacityValidatorService } from './daily-capacity-validator.service';
import {
  GlobalScheduleConfigRepository,
  ReservationRepository,
  ServiceRepository,
  UnitSettingRepository,
} from '../repository/';
import { ReservationsWithServices } from '../types';
import { SchedulerService } from './scheduler.service';
import { CreateBookingDto, FiltersDto, AvailableSlotsDto } from '../dto';
import { IAvaiableSlots } from '../interfaces/bookingNotifications.interface';

@Injectable()
export class BookingService {
  constructor(
    private readonly _globalScheduleConfigRepository: GlobalScheduleConfigRepository,
    private readonly _reservationRepository: ReservationRepository,
    private readonly _logger: WinstonLoggerService,
    private readonly _serviceTypeRepository: ServiceRepository,
    private readonly _responseHandler: ResponseService,
    private readonly _unitSettingsRepository: UnitSettingRepository,
    private readonly _schedulerService: SchedulerService,
    private readonly _dailyCapacityValidatorService: DailyCapacityValidatorService,
  ) {}
  async create(
    _createBookingDto: CreateBookingDto,
  ): Promise<DefultResponseDto<Reservation>> {
    const { serviceTypeId, date, client, clientPhone, hour } =
      _createBookingDto;

    try {
      //checkReservationValid
      const [isReservationValid, isSlotAvaible] = await Promise.all([
        this.checkReservationValid(date, serviceTypeId, hour),
        this.isTimeSlotAvailable(date, serviceTypeId, hour),
      ]);

      if (!isReservationValid || !isSlotAvaible)
        throw new UnprocessableEntityException(
          this._responseHandler.error(
            undefined,
            HttpStatusCode.UnprocessableEntity,
            'No hay disponibilidad',
          ),
        );

      //createa reservation.
      const data: Reservation = await this._reservationRepository.create({
        serviceTypeId,
        date: date,
        hour: hour,
        client: client,
        clientPhone: clientPhone,
      });
      return this._responseHandler.sanitize(
        data,
        ['Reserva Creada Exitosamente'],
        HttpStatusCode.Created,
      );
    } catch (error) {
      this._logger.error(error.message, {
        service: BookingService.name,
        method: 'create',
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
      if (error instanceof UnprocessableEntityException) throw error;

      throw new InternalServerErrorException(
        this._responseHandler.error(
          undefined,
          HttpStatusCode.InternalServerError,
          'Error trying create booking',
        ),
      );
    }
  }

  async checkReservationValid(
    _date: string,
    serviceTypeId: number,
    hour: string,
  ): Promise<boolean> {
    const [globalConfig, service] = await Promise.all([
      this._globalScheduleConfigRepository.getGlobalScheduleConfig(),
      this._serviceTypeRepository.findById(serviceTypeId),
    ]);

    if (!globalConfig || !service) {
      throw new UnprocessableEntityException(
        this._responseHandler.error(
          undefined,
          HttpStatusCode.UnprocessableEntity,
          'Global schedule config or service not found',
        ),
      );
    }

    //get reservations of the day joining the service type
    const reservations: ReservationsWithServices[] =
      await this._reservationRepository.findOfTheDay(_date, hour);

    if (!reservations.length) return true;

    const totalUnitsUsed = reservations.reduce(
      (sum, reservation) => sum + reservation.serviceType.unitsRequired,
      0,
    );

    const isValid: boolean =
      this._dailyCapacityValidatorService.isReservationValid(
        totalUnitsUsed,
        service.unitsRequired,
        globalConfig.defaultTotalUnits,
      );

    return isValid;
  }

  async isTimeSlotAvailable(
    IsoDate: string,
    serviceTypeId: number,
    hour: string,
  ): Promise<boolean> {
    const [service, unitSetting, reservations] = await Promise.all([
      this._serviceTypeRepository.findById(serviceTypeId),
      this._unitSettingsRepository.getUnitSettingsById(),
      this._reservationRepository.findOfTheDay(IsoDate, hour),
    ]);

    if (!service || !unitSetting)
      throw new UnprocessableEntityException(
        this._responseHandler.error(
          undefined,
          HttpStatusCode.UnprocessableEntity,
          'Service or global schedule config not found',
        ),
      );

    if (!reservations.length) return true;

    const SlotAvailable: boolean = this._schedulerService.isTimeSlotAvailable({
      isoDate: IsoDate,
      reservations: reservations,
      duration: service.unitsRequired,
      unitsRequiredOfService: unitSetting.unitDurationMinutes,
    });

    return SlotAvailable;
  }

  findAll(
    pagination: PaginationQueryDto<FiltersDto>,
  ): Promise<IPagination<Reservation>> {
    try {
      return this._reservationRepository.findAll(pagination);
    } catch (error) {
      this._logger.error(error.message, {
        service: BookingService.name,
        method: 'findAll',
        stack: error.stack,
      });
      throw new InternalServerErrorException('Error trying find bookings');
    }
  }
  changeStatus(
    reservationId: number,
    statusId: ReservationStatus,
  ): Promise<Reservation> {
    return this._reservationRepository.changeStatus(reservationId, statusId);
  }

  async getAvaiableSlots(
    avaiableSlotsDto: AvailableSlotsDto,
  ): Promise<DefultResponseDto<IAvaiableSlots>> {
    const serviceDuration = await this.getServiceDuration(
      avaiableSlotsDto.serviceId,
    );
    const durationDefault = await this.getUnitSetting();
    const reservations = await this.getReservations(avaiableSlotsDto.date);

    const usedHours = this.getHours(reservations);
    const normalizedUsedHours = usedHours.map(hour => hour.slice(0, 5));
    const available = this.computeAvailableSlots(
      normalizedUsedHours,
      durationDefault,
      serviceDuration,
    );

    const response: IAvaiableSlots = {
      date: avaiableSlotsDto.date,
      available: available,
      blocked: normalizedUsedHours,
      duration: serviceDuration,
    };

    return this._responseHandler.sanitize(
      response,
      ['Slots disponibles'],
      HttpStatusCode.Ok,
    );
  }

  private async getServiceDuration(serviceId: number): Promise<number> {
    const service = await this._serviceTypeRepository.findById(serviceId);
    if (!service) {
      throw new UnprocessableEntityException(
        this._responseHandler.error(
          undefined,
          HttpStatusCode.UnprocessableEntity,
          'Service not found',
        ),
      );
    }
    const unitSetting =
      await this._unitSettingsRepository.getUnitSettingsById();
    return unitSetting.unitDurationMinutes * service.unitsRequired;
  }
  private async getUnitSetting(): Promise<number> {
    const unitSetting =
      await this._unitSettingsRepository.getUnitSettingsById();
    if (!unitSetting) {
      throw new UnprocessableEntityException(
        this._responseHandler.error(
          undefined,
          HttpStatusCode.UnprocessableEntity,
          'Unit setting not found',
        ),
      );
    }
    return unitSetting.unitDurationMinutes;
  }

  private async getReservations(date: string): Promise<Reservation[]> {
    return this._reservationRepository.findOfTheDay(date);
  }

  private getHours(reservations: Reservation[]): string[] {
    return getHours(reservations);
  }

  private computeAvailableSlots(
    usedHours: string[],
    duration: number,
    totalServiceDuration: number,
  ): string[] {
    const startTimeMinutes = 7 * 60;
    const endTimeMinutes = 18 * 60;
    const unitDuration = duration; // fallback defensivo
    const requiredSlots = totalServiceDuration / unitDuration;

    const allSlots: string[] = [];
    for (
      let i = startTimeMinutes;
      i + totalServiceDuration <= endTimeMinutes;
      i += unitDuration
    ) {
      allSlots.push(minutesToTime(i));
    }

    const available: string[] = [];

    for (const slot of allSlots) {
      const start = timeToMinutes(slot);

      const slotSequence = Array.from({ length: requiredSlots }, (_, i) =>
        minutesToTime(start + i * unitDuration),
      );

      const isBlocked = slotSequence.some(time => usedHours.includes(time));
      if (!isBlocked) {
        available.push(slot);
      }
    }

    return available;
  }
}
