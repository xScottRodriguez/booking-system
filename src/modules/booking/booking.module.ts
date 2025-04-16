import { Module } from '@nestjs/common';

import { Providers } from '@root/src/common/enums';
import { CapacityService } from '@root/src/common/services/capacity.service';
import { DynamicUnitDurationStrategy } from '@root/src/common/strategy';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { NotificationService } from './notification.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RoleModule } from '@/modules/role/role.module';
import { RoleService } from '@/modules/role/role.service';

@Module({
  imports: [RoleModule, AuthModule, PrismaModule],
  controllers: [BookingController],
  providers: [
    BookingService,
    RoleService,
    NotificationService,
    CapacityService,
    DynamicUnitDurationStrategy,
    {
      provide: Providers.CAPACITY_STRATEGY,
      useClass: DynamicUnitDurationStrategy,
    },
  ],
  exports: [CapacityService],
})
export class BookingModule {}
