import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EncoderService } from './encoder/encoder.service';
import { UserRepository } from './repository/users.repository';
import { GoogleStrategy } from './strategies/google-strategy';
import { JwtStrategy } from './strategies/jwtStrategy';
import { PrismaModule } from '../prisma/prisma.module';
import { RoleModule } from '@/modules/role/role.module';

@Module({
  imports: [
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
    RoleModule,
    PrismaModule,
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
