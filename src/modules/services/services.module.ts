import { Module } from '@nestjs/common';

import { ServiceRepository } from './repository';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServicesController],
  providers: [ServicesService, ServiceRepository],
})
export class ServicesModule {}
