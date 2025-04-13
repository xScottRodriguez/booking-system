import { Module } from '@nestjs/common';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { NotificationService } from './notification.service';
import { AuthModule } from '../auth/auth.module';
import { RoleModule } from '@/modules/role/role.module';
import { RoleService } from '@/modules/role/role.service';

@Module({
  imports: [RoleModule, AuthModule],
  controllers: [BookingController],
  providers: [BookingService, RoleService, NotificationService],
})
export class BookingModule {}
