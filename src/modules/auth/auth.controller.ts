import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  Req,
  Param,
  Render,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { users } from '@prisma/client';
import { Roles } from '@root/src/common/enums';
import { RoleAuthGuard } from '@root/src/common/guards';
import { validate } from 'class-validator';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { CreateGoogleDto } from './dto';
import { ActivateUserDto } from './dto/activate-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiBearerAuth()
@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiConflictResponse({
    schema: {
      example: {
        statusCode: 409,
        message: 'This email is already registered',
        error: 'ConfictExecption',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error creating user',
        error: 'Internal Server Error',
      },
    },
    description: 'Internal Server Error',
  })
  @ApiCreatedResponse({
    description: 'User Created',
    schema: {
      example: {
        user: {
          id: 1,
          username: 'JohnDoe',
          email: 'johndoe@example.com',
          isActive: true,
          isGoogleAccount: false,
        },
        jwt: {
          accessToken: 'example',
        },
      },
    },
  })
  @Post('/local/register')
  create(
    @Body() createAuthDto: CreateAuthDto,
  ): Promise<Omit<users, 'password'>> {
    return this.authService.create(createAuthDto);
  }

  @ApiOkResponse({
    schema: {
      example: {
        user: {
          id: 1,
          username: 'JohnDoe',
          email: 'johndoe@example.com',
          isActive: true,
          isGoogleAccount: false,
        },
        jwt: {
          accessToken: 'example',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'Please check your credentials or Please verify your account',
        error: 'Unauthorized exception',
      },
    },
    description: 'Unauthorized Exception',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error trying to sign in',
        error: 'Internal Server Error',
      },
    },
    description: 'Internal Server Error',
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'user with email: xxxxx not found',
        error: 'Not Found execption',
      },
    },
    description: 'NotFoundException',
  })
  @Post('/local/login')
  login(@Body() loginAuthDto: LoginAuthDto): Promise<{
    user: Omit<users, 'password'>;
    jwt: {
      accessToken: string;
    };
  }> {
    return this.authService.login(loginAuthDto);
  }

  @ApiOkResponse({
    schema: {
      example: {
        user: {
          id: 1,
          username: 'JohnDoe',
          email: 'johndoe@example.com',
          isActive: true,
          isGoogleAccount: false,
        },
        jwt: {
          accessToken: 'example',
        },
      },
    },
    description: 'Login with google',
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'This email is already registered with google account',
        error: 'Unauthorized exception',
      },
    },
    description: 'Unauthorized Exception',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Error trying to sign in',
        error: 'Internal Server Error',
      },
    },
    description: 'Internal Server Error',
  })
  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleSignIn(@Req() req: Request): Promise<
    | {
        user: CreateGoogleDto;
        jwt: string;
      }
    | {
        user: Omit<users, 'password'>;
        jwt: {
          accessToken: string;
        };
      }
  > {
    return await this.authService.prepareUserRegister(req);
  }
  @ApiOkResponse({
    schema: {
      example: {
        user: {
          id: 1,
          username: 'JohnDoe',
          email: 'johndoe@example.com',
          isActive: true,
          isGoogleAccount: true,
        },
        jwt: {
          accessToken: 'example',
        },
      },
    },
    description: 'Login with google',
  })
  @Get('/google-accesses')
  googleAccess(@Query() params: { access_token: string }): Promise<
    | {
        user: Omit<users, 'password'>;
        jwt: {
          accessToken: string;
        };
      }
    | {
        user: CreateGoogleDto;
        jwt: string;
      }
  > {
    const { access_token } = params;
    return this.authService.prepareLoginGoogle(access_token);
  }
  @ApiOkResponse()
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'Error trying to reset password',
        error: 'Internal Server Error',
      },
    },
    description: 'NotFoundException',
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'user with email: xxxxx not found',
        error: 'Not Found execption',
      },
    },
    description: 'NotFoundException',
  })
  @Patch('/request-reset-password')
  requestResetPassword(
    @Body() requestResetPassword: RequestResetPasswordDto,
  ): Promise<void> {
    return this.authService.requestResetPassword(requestResetPassword);
  }

  @Get('reset-password/:token')
  @Render('index')
  resetPasswordView(@Param('token') token: string): {
    message: string;
    token: string;
  } {
    return { message: 'Hello world!', token: token };
  }

  @ApiOkResponse({ description: 'password successfully reset' })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'UnauthorizedResponse',
      },
    },
    description: 'Unauthorized error',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'InternalServerError',
      },
    },
    description: 'bad request',
  })
  @ApiNotFoundResponse({
    schema: {
      example: {
        statusCode: 404,
        message: 'Not Found',
        error: 'Not Found execption',
      },
    },
    description: 'NotFoundException',
  })
  @Post('/reset-password/:token')
  @Render('index')
  async resetPassword(
    @Param('token') token: string,
    @Body('password')
    password: string,
  ): Promise<
    | {
        response: string;
      }
    | {
        errorMessages: string[][];
        token: string;
      }
  > {
    const dto = new ResetPasswordDto();
    dto.password = password;
    dto.resetPasswordToken = token;
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map(error =>
        Object.values(error.constraints),
      );
      return { errorMessages, token };
    }
    return await this.authService.resetPassword(dto);
  }

  @ApiOkResponse({
    description: 'change password',
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'UnauthorizedResponse',
      },
    },
    description: 'Unauthorized error',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'InternalServerError',
      },
    },
    description: 'bad request',
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        statusCode: 400,
        message: 'old password does not match',
        error: 'BadRequest',
      },
    },
    description: 'bad request',
  })
  @ApiBearerAuth('access-token')
  @Patch('/change-passwords')
  @UseGuards(
    AuthGuard('jwt'),
    new RoleAuthGuard(Roles.AUTHENTICATED, Roles.ADMIN),
  )
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: users,
  ): Promise<void> {
    return this.authService.changePassword(changePasswordDto, user);
  }

  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'The account has been successfully activated',
  })
  @Get('/activate-accounts')
  async activateAccount(
    @Query() activateUserDto: ActivateUserDto,
  ): Promise<void> {
    return await this.authService.activateUser(activateUserDto);
  }

  @ApiUnauthorizedResponse({
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'UnauthorizedResponse',
      },
    },
    description: 'Unauthorized error',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(
    AuthGuard('jwt'),
    new RoleAuthGuard(Roles.ADMIN, Roles.AUTHENTICATED),
  )
  @Get('/me')
  async getProfile(@GetUser() user: users): Promise<Omit<users, 'password'>> {
    return await this.authService.getProfile(user);
  }

  @Post('/subscriptions')
  @UseGuards(
    AuthGuard('jwt'),
    new RoleAuthGuard(Roles.ADMIN, Roles.AUTHENTICATED),
  )
  async subscriptionNotifications(
    @Body() data: { token: string },
    @GetUser() user: users,
  ): Promise<void> {
    return await this.authService.subscriptionToNotifications(data.token, user);
  }
  @Get('/subscriptions/:id')
  @UseGuards(
    AuthGuard('jwt'),
    new RoleAuthGuard(Roles.ADMIN, Roles.AUTHENTICATED),
  )
  async getSubscriptions(@Param('id') id: string): Promise<boolean> {
    return await this.authService.checkSubscriptions(+id);
  }
}
