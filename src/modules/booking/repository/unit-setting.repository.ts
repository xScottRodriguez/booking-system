import { Injectable } from '@nestjs/common';

import { UnitSetting } from '@prisma/client';
import { PrismaService } from '@root/src/modules/prisma/prisma.service';

@Injectable()
export class UnitSettingRepository {
  constructor(private readonly _prisma: PrismaService) {}
  getUnitSettingsById(): Promise<UnitSetting> {
    return this._prisma.unitSetting.findFirst({
      where: {
        active: true,
        id: 1,
      },
    });
  }
}
