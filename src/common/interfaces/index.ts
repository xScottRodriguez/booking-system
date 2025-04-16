export * from './filter.interface';
export * from './gogle.interface';
export * from './pagination-query.dto';

export interface ISendVerificationEmail {
  to: string;
  token: string;
  username: string;
  userId: number;
}
