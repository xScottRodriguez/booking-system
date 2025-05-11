import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { randomUUID } from 'crypto';

import { users } from '@prisma/client';
import { DefultResponseDto } from '@root/src/common/dto';
import {
  ResponseService,
  WinstonLoggerService,
} from '@root/src/common/services';
import { UserSerialized } from '@root/src/common/types';
import { HttpStatusCode } from 'axios';

import { UpdateAuthDto } from './dto';
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
import { MailService } from '@/modules/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,

    private encoderService: EncoderService,

    private jwtService: JwtService,

    private mailService: MailService,

    private readonly _logger: WinstonLoggerService,

    private readonly _responseHandler: ResponseService,
  ) {}

  async create(
    createAuthDto: CreateAuthDto,
  ): Promise<DefultResponseDto<UserSerialized>> {
    try {
      const { password } = createAuthDto;
      const plainTextToHash =
        await this.encoderService.encodePassword(password);

      const role = await this.roleRepository.getDefaultRole();

      const user: users = await this.userRepository.create(
        {
          ...createAuthDto,
          password: plainTextToHash,
        },
        role.id,
      );
      this.mailService.sendVerificationEmail({
        to: user.email,
        token: user.activationToken,
        userId: user.id,
        username: user.username,
      });

      const {
        password: _password,
        resetPasswordToken: _resetPasswordToken,
        activationToken: _activationToken,
        ...userWithoutPassword
      } = user;
      return this._responseHandler.sanitize<UserSerialized>(
        userWithoutPassword,
        ['User Created'],
        HttpStatusCode.Created,
      );
    } catch (error) {
      this._logger.error(error.message, {
        stack: error.stack,
        context: AuthService.name,
      });

      if (error.code === 'P2002')
        throw new ConflictException(
          this._responseHandler.error('Error', HttpStatusCode.Conflict, [
            'Email already registered',
          ]),
        );

      throw new InternalServerErrorException(
        this._responseHandler.error(
          'Error',
          HttpStatusCode.InternalServerError,
          ['Error trying to create user'],
        ),
      );
    }
  }

  async login(loginAuthDto: LoginAuthDto): Promise<
    DefultResponseDto<{
      user: UserSerialized;
      jwt: {
        accessToken: string;
      };
    }>
  > {
    const user = await this.userRepository.findByEmail(loginAuthDto.email);

    if (!user)
      throw new NotFoundException(
        this._responseHandler.error(['Error'], HttpStatusCode.NotFound, [
          'User Not Found',
        ]),
      );

    if (user?.isGoogleAccount)
      throw new BadRequestException(
        this._responseHandler.error(
          ['Error'],
          HttpStatusCode.BadRequest,
          'This email is already registered with a google account',
        ),
      );

    const checkPassword = await this.encoderService.checkPassword(
      loginAuthDto.password,
      user?.password,
    );

    if (!checkPassword)
      throw new UnauthorizedException(
        this._responseHandler.error(
          ['Error'],
          HttpStatusCode.Unauthorized,
          'Please check your credentials',
        ),
      );

    if (!user.isActive)
      throw new UnauthorizedException(
        this._responseHandler.error(
          ['Error'],
          HttpStatusCode.Unauthorized,
          'Please verify your account',
        ),
      );

    const { id, email, isActive, roleId } = user;
    const payload: JwtPayload = {
      id,
      email,
      isActive,
      role: roleId,
    };
    try {
      const accessToken = this.jwtService.sign(payload);

      const {
        password: _password,
        activationToken: _activationToken,
        resetPasswordToken: _resetPasswordToken,
        ...userWithoutPassword
      } = user;

      return this._responseHandler.sanitize(
        {
          user: userWithoutPassword,
          jwt: { accessToken },
        },
        ['Login Success'],
        HttpStatusCode.Ok,
      );
    } catch (error) {
      this._logger.error(error.message, {
        stack: error.stack,
        context: AuthService.name,
      });

      throw new InternalServerErrorException(
        this._responseHandler.error([''], HttpStatusCode.InternalServerError, [
          'Error trying sign in',
        ]),
      );
    }
  }

  async activateUser(activateUserDto: ActivateUserDto): Promise<void> {
    const { id, code } = activateUserDto;
    const user: users = await this.findOneInactiveByIdActivationToken(
      +id,
      code,
    );
    if (!user)
      throw new UnprocessableEntityException(
        this._responseHandler.error(
          ['Error'],
          HttpStatusCode.UnprocessableEntity,
          'This action can not be done',
        ),
      );

    try {
      await this.userRepository.updateUser(user.id, {
        ...user,
        isActive: true,
        activationToken: null,
      });
    } catch (error) {
      this._logger.error(error.message, {
        stack: error.stack,
        context: AuthService.name,
      });
      throw new InternalServerErrorException(
        this._responseHandler.error(
          ['Error'],
          HttpStatusCode.InternalServerError,
          'Error trying activation account',
        ),
      );
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
      throw new NotFoundException(
        this._responseHandler.error(
          ['Error'],
          HttpStatusCode.NotFound,
          'User not found',
        ),
      );

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
        resetPasswordToken,
      });
      await this.mailService.sendPasswordResetEmail(
        user.email,
        resetPasswordToken,
      );
    } catch (error) {
      this._logger.error(error.message, {
        stack: error.stack,
        context: AuthService.name,
      });
      throw new InternalServerErrorException(
        this._responseHandler.error(
          ['Error'],
          HttpStatusCode.InternalServerError,
          'Error trying to send email',
        ),
      );
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
      this._logger.error(error.message, {
        stack: error.stack,
        context: AuthService.name,
      });
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

    if (!isValid)
      throw new BadRequestException(
        this._responseHandler.error(
          ['Error'],
          HttpStatusCode.BadRequest,
          'Old password does not match',
        ),
      );

    const hashPassword = await this.encoderService.encodePassword(newPassword);
    await this.userRepository.updateUser(user.id, {
      password: hashPassword,
    });
  }

  async prepareUserRegister(user: CreateGoogleDto): Promise<
    DefultResponseDto<{
      user: UserSerialized;
      jwt: {
        accessToken: string;
      };
    }>
  > {
    try {
      const userExist: users = await this.userRepository.findByEmail(
        user.email,
      );
      if (!userExist) {
        return this.registerUserWithGoogle(user);
      }

      return this.loginWithGoogle(userExist);
    } catch (error) {
      this._logger.error(error.message, {
        stack: error.stack,
        context: AuthService.name,
      });
      throw new InternalServerErrorException(
        this._responseHandler.error(
          ['Error'],
          HttpStatusCode.InternalServerError,
          'Error trying to register user',
        ),
      );
    }
  }

  async loginWithGoogle(loginAuthDto: users): Promise<
    DefultResponseDto<{
      user: UserSerialized;
      jwt: {
        accessToken: string;
      };
    }>
  > {
    if (!loginAuthDto.isGoogleAccount) {
      await this.activateUserWithGoogle(loginAuthDto.email);
    }

    const payload: JwtPayload = {
      id: loginAuthDto.id,
      email: loginAuthDto.email,
      isActive: loginAuthDto.isActive,
      role: loginAuthDto.roleId,
      isGoogleAccount: loginAuthDto.isGoogleAccount,
    };
    const { password: _password, ...userWithoutPassword } = loginAuthDto;
    return this._responseHandler.sanitize(
      {
        user: userWithoutPassword,
        jwt: { accessToken: this.jwtService.sign(payload) },
      },
      ['Login Success'],
      HttpStatusCode.Ok,
    );
  }

  async registerUserWithGoogle(user: CreateGoogleDto): Promise<
    DefultResponseDto<{
      user: UserSerialized;
      jwt: {
        accessToken: string;
      };
    }>
  > {
    const role = await this.roleRepository.getDefaultRole();
    const userCreated = await this.userRepository.create(
      {
        email: user.email,
        username: user.username,
      },
      role.id,
      true,
    );

    const payload: JwtPayload = {
      id: userCreated.id,
      email: userCreated.email,
      isActive: userCreated.isActive,
      isGoogleAccount: userCreated.isGoogleAccount,
      role: userCreated.roleId,
    };

    const accessToken = this.jwtService.sign(payload);

    return this._responseHandler.sanitize(
      { user: userCreated, jwt: { accessToken: accessToken } },
      ['User Created'],
      HttpStatusCode.Created,
    );
  }

  async getProfile(user: users): Promise<DefultResponseDto<UserSerialized>> {
    const {
      password: _password,
      activationToken: _activationToken,
      resetPasswordToken: _resetPasswordToken,
      ...userWithoutPassword
    } = user;
    return this._responseHandler.sanitize(
      userWithoutPassword,
      ['User Found'],
      HttpStatusCode.Ok,
    );
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
    //   this._logger.error(error.message);
    //   throw new InternalServerErrorException('Something Wen Wrong');
    // }
  }

  activateUserWithGoogle(email: string): Promise<users> {
    return this.userRepository.activeGoogleAccount(email);
  }
  updateProfile(updateUserDto: UpdateAuthDto, user: users): Promise<users> {
    try {
      return this.userRepository.updateUser(user.id, updateUserDto);
    } catch (error) {
      this._logger.error('Something went wrong', {
        stack: error.stack,
        message: error.message,
        context: AuthService.name,
      });
      throw new InternalServerErrorException(
        this._responseHandler.error(
          ['Error'],
          HttpStatusCode.InternalServerError,
          'Error trying to update user',
        ),
      );
    }
  }
}
