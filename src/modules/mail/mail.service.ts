import { Injectable, Logger } from '@nestjs/common';

import { envs } from '@root/src/common/config';
import { compileTemplate, getMessage } from '@root/src/common/utils';
import { CreateEmailOptions, Resend } from 'resend';

import { MailerServiceInterface } from './interfaces';

@Injectable()
export class MailService implements MailerServiceInterface {
  private resend: Resend;
  #logger = new Logger(MailService.name);
  constructor() {
    this.resend = new Resend(envs.resendApiKey);
  }

  async sendVerificationEmail(
    to: string,
    token: string,
    username: string,
  ): Promise<void> {
    const url = `${envs.apiBaseUrl}/auth/activate-accounts/?code=${token}`;
    const [html, subject] = await Promise.all<
      [Promise<string>, Promise<string>]
    >([
      compileTemplate('transactional', { url: url, username: username }),
      getMessage('mail.subject'),
    ]);
    const payload: CreateEmailOptions = {
      from: envs.senderMail,
      to,
      subject: subject,
      html: html,
    };

    this.resend.emails
      .send(payload)
      .then(dat => {
        this.#logger.log(
          `Verification email sent successfully: ${JSON.stringify(dat, null, 2)}`,
        );
      })
      .catch(error => {
        this.#logger.error(`Error sending verification email: ${error}`);
      })
      .finally(() => {
        this.#logger.log('Verification email sent successfully');
      });
  }
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const url = `${envs.apiBaseUrl}/auth/reset-password/${token}`;
    const [html, subject] = await Promise.all<
      [Promise<string>, Promise<string>]
    >([compileTemplate('reset-password', { url }), getMessage('mail.subject')]);

    const sendMailOptions: CreateEmailOptions = {
      from: envs.senderMail,
      to,
      subject: subject,
      html: html,
    };

    this.resend.emails
      .send(sendMailOptions)
      .catch(error => {
        this.#logger.error(`Error sending password reset email: ${error}`);
      })
      .finally(() => {
        this.#logger.log('Password reset email sent successfully');
      });
  }
}
