import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { randomUUID } from 'crypto';

import { roles, users } from '@prisma/client';
import { AxiosError } from 'axios';
import { Request } from 'express';
import { catchError, firstValueFrom } from 'rxjs';

import { ActivateUserDto } from './dto/activate-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { CreateGoogleDto } from './dto/create-google.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EncoderService } from './encoder/encoder.service';
import { JwtPayload } from './interfaces/jwt.interface';
import { UserRepository } from './repository';
import { RoleRepository } from '../role/repository';
import { IGoogleAccount } from '@/interfaces/gogle.interface';
import { MailService } from '@/modules/mail/mail.service';

@Injectable()
export class AuthService {
  #logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,

    private encoderService: EncoderService,

    private jwtService: JwtService,

    private mailService: MailService,

    private readonly httpService: HttpService,
  ) {}

  async create(createAuthDto: CreateAuthDto): Promise<Omit<users, 'password'>> {
    try {
      const { password } = createAuthDto;
      const plainTextToHash =
        await this.encoderService.encodePassword(password);

      const role = await this.roleRepository.getDefaultRole();

      console.log({ role });
      const user: users = await this.userRepository.create(
        {
          ...createAuthDto,
          password: plainTextToHash,
        },
        role.id,
      );
      await this.mailService.sendVerificationUsers(user, user.activationToken);

      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.#logger.error({ error });

      if (error.code === '23505')
        throw new ConflictException('This email is already registered');

      throw new InternalServerErrorException('Error creating user');
    }
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{
    user: users;
    jwt: {
      accessToken: string;
    };
  }> {
    const user = await this.userRepository.findByEmail(loginAuthDto.email);

    if (user.isGoogleAccount)
      throw new BadRequestException(
        'This email is already registered with a google account',
      );

    const checkPassword = await this.encoderService.checkPassword(
      loginAuthDto.password,
      user.password,
    );

    if (!checkPassword)
      throw new UnauthorizedException('Please check your credentials');

    if (!user.isActive)
      throw new UnauthorizedException('Please verify your account');

    const { id, email, isActive, roleId } = user;
    const payload: JwtPayload = {
      id,
      email,
      isActive,
      role: roleId,
    };
    try {
      const accessToken = this.jwtService.sign(payload);

      const { password: _password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        jwt: { accessToken },
      };
    } catch (error) {
      this.#logger.error(error);
      throw new InternalServerErrorException('Error trying to sign in');
    }
  }

  async activateUser(activateUserDto: ActivateUserDto): Promise<void> {
    const { id, code } = activateUserDto;
    const user: users = await this.findOneInactiveByIdActivationToken(
      +id,
      code,
    );
    if (!user)
      throw new UnprocessableEntityException('This action can not be done');

    try {
      await this.userRepository.updateUser(user.id, {
        ...user,
        isActive: true,
        activationToken: null,
      });
    } catch (error) {
      this.#logger.error(error.message);
      throw new InternalServerErrorException('Error trying activation account');
    }
  }

  findOneInactiveByIdActivationToken(id: number, code: string): Promise<users> {
    return this.userRepository.findOneByIdAndActivationtokenAndIsActive(
      id,
      code,
    );
  }

  async findByEmail(email: string): Promise<users> {
    const user = await this.userRepository.findByEmail(email);
    if (!user)
      throw new NotFoundException(`user with email: ${email} not found`);

    return user;
  }

  async requestResetPassword(
    requestResetPassword: RequestResetPasswordDto,
  ): Promise<void> {
    const { email } = requestResetPassword;
    try {
      const user: users = await this.findByEmail(email);

      const resetPasswordToken = randomUUID();
      await this.userRepository.updateUser(user.id, {
        ...user,
        resetPasswordToken,
      });
      await this.mailService.sendResetPassword(user, resetPasswordToken);
    } catch (error) {
      this.#logger.error(error.message);
      throw new InternalServerErrorException('Error trying to reset password');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
    response: string;
  }> {
    try {
      const { password, resetPasswordToken } = resetPasswordDto;

      const user: users =
        await this.findOneByResetPasswordToken(resetPasswordToken);
      const newPassword = await this.encoderService.encodePassword(password);

      await this.userRepository.updateUser(user.id, {
        ...user,
        password: newPassword,
        resetPasswordToken: null,
      });

      return {
        response:
          'Password successfully updated. Please log in with your new password at your next login.',
      };
    } catch (error) {
      this.#logger.error(error.message);
      throw new InternalServerErrorException('Error trying to reset');
    }
  }

  async findOneByResetPasswordToken(
    resetPasswordToken: string,
  ): Promise<users> {
    const user: users =
      await this.userRepository.findOneByResetPasswordToken(resetPasswordToken);
    if (!user) throw new NotFoundException();

    return user;
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    user: users,
  ): Promise<void> {
    const { oldPassword, newPassword } = changePasswordDto;

    const isValid = await this.encoderService.checkPassword(
      oldPassword,
      user.password,
    );

    if (!isValid) throw new BadRequestException('old password does not match');

    const hashPassword = await this.encoderService.encodePassword(newPassword);
    await this.userRepository.updateUser(user.id, {
      ...user,
      password: hashPassword,
    });
  }

  async prepareUserRegister(req: Request): Promise<
    | {
        user: CreateGoogleDto;
        jwt: string;
      }
    | {
        user: users;
        jwt: {
          accessToken: string;
        };
      }
  > {
    if (!req.user) throw new NotFoundException('Not user from google');

    const user = {
      username: `${req.user?.['firstName']} ${req.user?.['lastName']}`,
      email: req.user?.['email'],
    };
    const userExist: users = await this.userRepository.findByEmail(user.email);
    if (!userExist) return this.registerUserWithGoogle(user);

    return this.loginWithGoogle(userExist);
  }

  async loginWithGoogle(loginAuthDto: users): Promise<{
    user: users;
    jwt: {
      accessToken: string;
    };
  }> {
    if (!loginAuthDto.isGoogleAccount)
      throw new ConflictException(
        'This email is already registered with a local account',
      );

    const { id, email, isActive, roleId } = loginAuthDto;
    const payload: JwtPayload = {
      id,
      email,
      isActive,
      role: roleId,
    };
    try {
      const { password: _password, ...userWithoutPassword } = loginAuthDto;
      return {
        user: userWithoutPassword,
        jwt: { accessToken: this.jwtService.sign(payload) },
      };
    } catch (error) {
      this.#logger.error(error);
      throw new InternalServerErrorException('Error trying to sign in');
    }
  }

  async prepareLoginGoogle(accessToken: string): Promise<
    | {
        user: users;
        jwt: {
          accessToken: string;
        };
      }
    | {
        user: CreateGoogleDto;
        jwt: string;
      }
  > {
    const { data } = await firstValueFrom(
      this.httpService
        .get<IGoogleAccount>(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.#logger.error(error.response.data);
            throw new Error('An error happened!');
          }),
        ),
    );
    const userExist: users = await this.userRepository.findByEmail(data.email);
    const user = {
      username: data.name,
      email: data.email,
    };

    if (!userExist) return this.registerUserWithGoogle(user);

    return this.loginWithGoogle(userExist);
  }

  async registerUserWithGoogle(user: CreateGoogleDto): Promise<{
    user: CreateGoogleDto;
    jwt: string;
  }> {
    const userRole: roles = await this.roleRepository.getDefaultRole();
    const values = {
      ...user,
      isGoogleAccount: true,
      isActive: true,
    };

    try {
      const { id, email, isActive, roleId } = await this.userRepository.create(
        values,
        userRole.id,
      );
      const payload: JwtPayload = {
        id,
        email,
        isActive,
        role: roleId,
      };

      const accessToken = this.jwtService.sign(payload);

      return { user, jwt: accessToken };
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('This email is already registered');

      this.#logger.debug(error);

      throw new InternalServerErrorException('Error creating user');
    }
  }

  async getProfile(user: users): Promise<users> {
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async subscriptionToNotifications(
    _token: string,
    _user: users,
  ): Promise<void> {
    //await this.userRepository.sun
  }

  async checkSubscriptions(_id: number): Promise<boolean> {
    return false;
    // try {
    //   const user = await this.userRepository.findOneBy({
    //     id,
    //   });
    //
    //   return !!user.deviceToken;
    // } catch (error) {
    //   this.#logger.error(error.message);
    //   throw new InternalServerErrorException('Something Wen Wrong');
    // }
  }
}
