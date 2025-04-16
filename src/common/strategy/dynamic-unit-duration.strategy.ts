import { Injectable } from '@nestjs/common';

import { PrismaService } from '@root/src/modules/prisma/prisma.service';

import { CapacityStrategy } from './capacity.strategy.interface';

/**
 * DynamicUnitDurationStrategy
 *  This strategy calculates the maximum number of units available based on the unit DynamicUnitDurationStrategy
 *   @param workMinutesPerDay - The number of minutes available for work in a day.
 *   @return The maximum number of units available.
 *
 */
@Injectable()
export class DynamicUnitDurationStrategy implements CapacityStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async getMaxUnitsAvailable(workMinutesPerDay: number = 480): Promise<number> {
    const unitSetting = await this.prisma.unitSetting.findFirst({
      where: { active: true },
    });

    if (!unitSetting) {
      throw new Error('No active unit settings found');
    }

    const { unitDurationMinutes } = unitSetting;

    // Calculamos las unidades máximas que se pueden trabajar en un día
    return Math.floor(workMinutesPerDay / unitDurationMinutes);
  }
}
