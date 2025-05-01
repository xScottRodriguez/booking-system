export interface IBookingsNotifications {
  id: number;
  username: string;
  service: string;
  state: string;
  note: string;
  date: Date;
}

export interface IPayloadNotification {
  body: string;
  token: string;
}

export interface IAvaiableSlots {
  date: string;
  available: string[];
  blocked: string[];
  duration: number;
}
