import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { envs } from '@root/src/common/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EncoderService } from './encoder/encoder.service';
import { UserRepository } from './repository/users.repository';
import { GoogleStrategy } from './strategies/google-strategy';
import { JwtStrategy } from './strategies/jwtStrategy';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RoleModule } from '@/modules/role/role.module';

@Module({
  imports: [
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [],
      useFactory: async () => ({
        secret: envs.jwtSecret,
        signOptions: {
          expiresIn: envs.jwtExpirationTime,
        },
      }),
      inject: [],
    }),
    RoleModule,
    PrismaModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EncoderService,
    JwtStrategy,
    GoogleStrategy,
    UserRepository,
  ],
  exports: [JwtStrategy, PassportModule, UserRepository],
})
export class AuthModule {}
