import { Injectable } from '@nestjs/common';

/**
 * Service to validate daily capacity for reservations.
 * This service checks if the number of units already used plus the units required for a new reservation
 * does not exceed the default total units available for that day.
 *
 * @class DailyCapacityValidatorService
 * @method isReservationValid
 * @param {number} unitsAlreadyUsed - The number of units already used for the day.
 * @param {number} unitsRequired - The number of units required for the new reservation.
 * @param {number} defaultTotalUnits - The default total units available for the day.
 * @return {boolean} - Returns true if the reservation is valid, false otherwise.
 *
 */
@Injectable()
export class DailyCapacityValidatorService {
  isReservationValid(
    unitsAlreadyUsed: number,
    unitsRequired: number,
    defaultTotalUnits: number,
  ): boolean {
    return unitsAlreadyUsed + unitsRequired <= defaultTotalUnits;
  }
}
