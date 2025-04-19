import { Injectable } from '@nestjs/common';

import { DateTime } from 'luxon';

import { ReservationsWithServices } from '../types';

interface ITimeSlot {
  isoDate: string;
  reservations: ReservationsWithServices[];
  duration: number;
  unitsRequiredOfService: number;
}

/**
 * SchedulerService is responsible for checking the availability of time slots
 * for reservations based on existing reservations and their durations.
 * It uses the luxon library for date and time manipulation.
 *
 * @class SchedulerService
 * @method isTimeSlotAvailable
 * @param {ITimeSlot} params - The parameters for checking time slot availability.
 * @returns {boolean} - Returns true if the time slot is available, false otherwise.
 */

@Injectable()
export class SchedulerService {
  isTimeSlotAvailable(params: ITimeSlot): boolean {
    const { isoDate, reservations, duration, unitsRequiredOfService } = params;

    const newStart = DateTime.fromISO(isoDate);
    const newEnd = newStart.plus({
      minutes: unitsRequiredOfService * duration,
    });

    for (const reservation of reservations) {
      const existingStart = DateTime.fromISO(reservation.reservationDate);
      const existingEnd = existingStart.plus({
        minutes: reservation.serviceType.unitsRequired * duration,
      });

      // Check if the new time slot overlaps with any existing reservations
      if (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      ) {
        return false; // Time slot is not available
      }
    }
    return true; // Time slot is available
  }
}
