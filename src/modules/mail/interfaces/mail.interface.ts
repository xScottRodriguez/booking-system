import { ISendVerificationEmail } from '@root/src/common/interfaces';

export interface MailerServiceInterface {
  sendVerificationEmail(params: ISendVerificationEmail): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
}
