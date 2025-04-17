import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

import {
  GlobalScheduleConfig,
  Reservation,
  ServiceType,
  users,
} from '@prisma/client';
import { DefultResponseDto } from '@root/src/common/dto';
import {
  ResponseService,
  WinstonLoggerService,
} from '@root/src/common/services';
import { HttpStatusCode } from 'axios';

import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import {
  GlobalScheduleConfigRepository,
  ReservationRepository,
  ServiceRepository,
} from './repository';
import { ReservationsWithServices } from './types';

@Injectable()
export class BookingService {
  constructor(
    private readonly _globalScheduleConfigRepository: GlobalScheduleConfigRepository,
    private readonly _reservationRepository: ReservationRepository,
    private readonly _logger: WinstonLoggerService,
    private readonly _serviceTypeRepository: ServiceRepository,
    private readonly _responseHandler: ResponseService,
  ) {}
  async create(
    _createBookingDto: CreateBookingDto,
  ): Promise<DefultResponseDto<Reservation>> {
    const { serviceTypeId, date, clientId } = _createBookingDto;

    try {
      //checkReservationValid
      const isValid = await this.checkReservationValid(date, serviceTypeId);

      if (!isValid)
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
        date,
        clientId: clientId,
      });
      return this._responseHandler.sanitize(
        data,
        ['Reserva Creada Exitosamente'],
        HttpStatusCode.Created,
      );
    } catch (error) {
      this._logger.error(JSON.stringify(error), {
        service: BookingService.name,
        method: 'create',
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
  ): Promise<boolean> {
    //get unit dailyCapacity;
    const globalScheduleConfig: GlobalScheduleConfig =
      await this._globalScheduleConfigRepository.getGlobalScheduleConfig();

    if (!globalScheduleConfig)
      throw new Error('Global schedule config not found');

    const { defaultTotalUnits } = globalScheduleConfig;
    //get reservations of the day joining the service type
    const data: ReservationsWithServices[] =
      await this._reservationRepository.findOfTheDay(_date);

    if (!data.length) return true;

    //check
    const totalUnitsusedInTheCurrentDay: number = data.reduce(
      (acc, reservation) => {
        return acc + reservation.serviceType.unitsRequired;
      },
      0,
    );
    //check if the total units used is less than the daily capacity
    const totalUnitsAvailable: number =
      defaultTotalUnits - totalUnitsusedInTheCurrentDay;

    const service: ServiceType =
      await this._serviceTypeRepository.findById(serviceTypeId);

    if (!service) throw new Error('Service not found');

    //check if the service type is valid
    const unitsOfServiceType: number = service.unitsRequired;

    return totalUnitsAvailable >= unitsOfServiceType;
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

  async findAll(_user: users): Promise<void> {
    // try {
    //   // get admin role
    //   const role = await this.roleService.getOne(1);
    //   if (user.roleId === role.id)
    //     return await this.bookingRepository.find({
    //       relations: {
    //         clientId: { role: true },
    //         statusId: true,
    //       },
    //       order: {
    //         date: OrderType.DESC,
    //       },
    //     });
    //
    //   return await this.bookingRepository.find({
    //     relations: {
    //       clientId: true,
    //       statusId: true,
    //     },
    //     where: {
    //       clientId: {
    //         id: user.id,
    //       },
    //     },
    //   });
    // } catch (error) {
    //   this.#logger.error(error.message);
    //   throw new InternalServerErrorException('Error trying find bookings');
    // }
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
