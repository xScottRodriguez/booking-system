import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';

import { envs } from './common/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { BookingModule } from '@/modules/booking/booking.module';
import { MailModule } from '@/modules/mail/mail.module';
import { RoleModule } from '@/modules/role/role.module';
import { StatusModule } from '@/modules/status/status.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),

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
    AuthModule,
    BookingModule,
    MailModule,
    RoleModule,
    StatusModule,
    PrismaModule,
  ],
  providers: [],
})
export class AppModule {}
