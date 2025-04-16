import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

import { GlobalScheduleConfig, users } from '@prisma/client';
import { Providers } from '@root/src/common/enums';
import { CapacityService } from '@root/src/common/services/capacity.service';

import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import {
  GlobalScheduleConfigRepository,
  ReservationRepository,
} from './repository';
import { ReservationsWithServices } from './types';

@Injectable()
export class BookingService {
  constructor(
    @Inject(Providers.CAPACITY_STRATEGY)
    private readonly _capacityService: CapacityService,
    private readonly _globalScheduleConfigRepository: GlobalScheduleConfigRepository,
    private readonly _reservationRepository: ReservationRepository,
  ) {}
  async create(_createBookingDto: CreateBookingDto): Promise<void> {
    const { serviceTypeId: _type, date, clientId: _cid } = _createBookingDto;

    //checkReservationValid
    const isValid = await this.checkReservationValid(date);

    if (!isValid) throw new UnprocessableEntityException();

    // const { client, status } = await this.findServiceClientStatus(
    //   createBookingDto.serviceId,
    //   createBookingDto.clientId,
    // );
    // const formatDate = new Date(createBookingDto.date).toISOString();
    // const bookingToSave = this.bookingRepository.create({
    //
    //   ...createBookingDto,
    //   date: formatDate,
    //   clientId: client,
    //   statusId: status,
    // });
    // const dateToCheck = new Date(createBookingDto.date);
    // const isValidBooking = await this.checkReservationValid(dateToCheck);
    // if (isValidBooking)
    //   throw new ConflictException(
    //     'A reservation already exists for the time you are trying to book',
    //   );
    //
    // try {
    //   return await this.bookingRepository.save(bookingToSave);
    // } catch (error) {
    //   this.#logger.error(error.message);
    //
    //   throw new InternalServerErrorException('Error trying create booking');
    // }
  }

  async checkReservationValid(
    _date: string,
    _excludeBookingId?: number,
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

    return totalUnitsAvailable > 0;
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
