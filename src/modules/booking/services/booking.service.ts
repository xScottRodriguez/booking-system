import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Reservation } from '@prisma/client';
import { DefultResponseDto } from '@root/src/common/dto';
import { PaginationQueryDto } from '@root/src/common/interfaces';
import { IPagination } from '@root/src/common/interfaces/pagination.interface';
import {
  ResponseService,
  WinstonLoggerService,
} from '@root/src/common/services';
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
import { CreateBookingDto, FiltersDto, UpdateBookingDto } from '../dto';

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
      this._logger.log('se puede reservar?', {
        service: BookingService.name,
        method: 'create',
        isReservationValid,
        isSlotAvaible,
      });
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
      this._logger.error(error, {
        service: BookingService.name,
        method: 'create',
        error,
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

    this._logger.warn(
      'CASO DE USO: ESTA DISPONIBLE LA FECHA PERO NO EL TIPO DE CORTE POR PASAR EL LIMITE DE 5',
      {
        service: BookingService.name,
        method: 'checkReservationValid',
        totalUnitsUsed,
        unitsRequired: service.unitsRequired,
        globalConfigDefaultTotalUnits: globalConfig.defaultTotalUnits,
      },
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

  async findServiceClientStatus(
    _clientId: number,
    _stateId?: number,
  ): Promise<void> {
    //
    //
    // const client = await this.userRepository.findOneById(clientId);
    //
    // if (!client) throw new NotFoundException('Client not found');
    //
    // let status = null;
    // if (stateId)
    //   status = await this.statusRepository.findOne({
    //     where: { id: stateId },
    //   });
    // else
    //   status = await this.statusRepository.findOne({
    //     where: { name: 'Reservado' },
    //   });
    //
    // if (!status) throw new NotFoundException('Status not found');
    //
    // return { client, status };
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

  async update(
    _id: number,
    _updateBookingDto: UpdateBookingDto,
  ): Promise<void> {
    // const existsBooking = await this.bookingRepository.findOneBy({ id });
    //
    // if (!existsBooking) throw new BadRequestException('Booking not found');
    //
    // const { client, status } = await this.findServiceClientStatus(
    //   updateBookingDto.serviceId,
    //   updateBookingDto.clientId,
    // );
    //
    // const bookingToSave = this.bookingRepository.create({
    //   ...updateBookingDto,
    //   clientId: client,
    //   statusId: status,
    // });
    // const isValidBooking = await this.checkReservationValid(
    //   bookingToSave.date,
    //   id,
    // );
    // if (isValidBooking)
    //   throw new ConflictException(
    //     'A reservation already exists for the time you are trying to book',
    //   );
    //
    // try {
    //   await this.bookingRepository
    //     .createQueryBuilder()
    //     .update(Booking)
    //     .set(bookingToSave)
    //     .where('id= :id', { id })
    //     .execute();
    // } catch (error) {
    //   this.#logger.error(error.message);
    //
    //   throw new InternalServerErrorException('Error trying create booking');
    // }
  }

  async updateStateBooking(_id: number, _stateId: number): Promise<void> {
    // try {
    //   await this.bookingRepository
    //     .createQueryBuilder()
    //     .update(Booking)
    //     .set({
    //       statusId: {
    //         id: stateId,
    //       },
    //     })
    //     .where('id =:id', { id })
    //     .execute();
    // } catch (error) {
    //   throw new InternalServerErrorException(error.message);
    // }
  }

  async remove(_id: number): Promise<void> {
    // try {
    //   await this.bookingRepository
    //     .createQueryBuilder('Booking')
    //     .delete()
    //     .from(Booking)
    //     .where('id =:id', { id })
    //     .execute();
    // } catch (error) {
    //   throw new InternalServerErrorException('Error trying Delete Booking');
    // }
  }
}
