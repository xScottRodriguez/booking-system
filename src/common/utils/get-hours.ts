import { Reservation } from '@prisma/client';

const getHours = (reservations: Reservation[]): string[] => {
  return reservations.map(
    (reservation: Reservation) => reservation.scheduledTime,
  );
};

export { getHours };
