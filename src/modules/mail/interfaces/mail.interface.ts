export interface MailerServiceInterface {
  sendVerificationEmail(
    to: string,
    token: string,
    username: string,
  ): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
}
