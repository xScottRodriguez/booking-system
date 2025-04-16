import { Reservation } from '@prisma/client';

export type ReservationsWithServices = Reservation & {
  serviceType: {
    unitsRequired: number;
    name: string;
  };
};
