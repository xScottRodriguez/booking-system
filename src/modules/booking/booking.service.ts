import { Injectable, Logger } from '@nestjs/common';

import { users } from '@prisma/client';

import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UserRepository } from '../auth/repository';
import { RoleService } from '@/modules/role/role.service';

@Injectable()
export class BookingService {
  #logger = new Logger(BookingService.name);
  constructor(
    private readonly _userRepository: UserRepository,

    private readonly _roleService: RoleService,
  ) {}
  async create(_createBookingDto: CreateBookingDto): Promise<void> {
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
    _date: Date,
    _excludeBookingId?: number,
  ): Promise<void> {
    // const MINIMUM_TIME_DIFFERENCE = 30;
    // const ONE_MINUTE = 60000;
    // try {
    //   const bookings = await this.bookingRepository
    //     .createQueryBuilder('booking')
    //     .where(`DATE(booking.date) = :date`, { date })
    //     .getMany();
    //
    //   date = new Date(date);
    //
    //   return bookings.some(booking => {
    //     if (booking.id === excludeBookingId) return false; // Skip excluded booking
    //
    //     const dbReservationTime = new Date(booking.date);
    //     const diffInMinutes = Math.abs(
    //       Math.round(
    //         (dbReservationTime.getTime() - date.getTime()) / ONE_MINUTE,
    //       ),
    //     );
    //
    //     return diffInMinutes < MINIMUM_TIME_DIFFERENCE;
    //   });
    // } catch (error) {
    //   this.#logger.error(error.message);
    //   throw new InternalServerErrorException('Error trying create booking');
    // }
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

  async update(_id: number, _updateBookingDto: UpdateBookingDto) {
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

  async updateStateBooking(_id: number, _stateId: number) {
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

  async remove(_id: number) {
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
