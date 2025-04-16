import { users } from '@prisma/client';

export type UserSerialized = Omit<
  users,
  'password' | 'activationToken' | 'resetPasswordToken'
>;
