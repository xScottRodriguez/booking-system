import { Injectable, Logger } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';
import { users } from '@prisma/client';

import { ConfigurationService } from '@/config/configuration';

@Injectable()
export class MailService {
  #logger = new Logger(MailService.name);
  constructor(private mailerService: MailerService) {}

  async sendVerificationUsers(user: users, token: string): Promise<boolean> {
    const configService = new ConfigurationService();
    const url = `${configService.getapiBaseUrl()}/auth/activate-accounts/?id=${
      user.id
    }&code=${token}`;
    const sendMailOptions = {
      from: configService.getSender(),
      to: user.email,
      subject: 'Welcome to Mi application; Confirm Your Account!',
      template: './transactional',
      context: {
        name: user.username,
        url,
      },
    };

    try {
      this.#logger.debug('MAIL SEND');
      await this.mailerService.sendMail(sendMailOptions);
      return true;
    } catch (error) {
      this.#logger.error(error.message);

      return false;
    }
  }
  async sendResetPassword(user: users, token: string): Promise<boolean> {
    const configService = new ConfigurationService();
    const url = `${configService.getapiBaseUrl()}/auth/reset-password/${token}`;
    const sendMailOptions = {
      from: configService.getSender(),
      to: user.email,
      subject: 'Your Candy Cake password',
      template: './reset-password',
      context: {
        name: user.username,
        url,
      },
    };

    try {
      this.#logger.debug('MAIL SEND');
      await this.mailerService.sendMail(sendMailOptions);
      return true;
    } catch (error) {
      this.#logger.error(error);

      return false;
    }
  }
}
