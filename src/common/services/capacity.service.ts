import { Inject, Injectable } from '@nestjs/common';

import { Providers } from '../enums';
import { CapacityStrategy } from '../strategy';

const DEFAULT_WORK_MINUTES_PER_DAY = 480;
@Injectable()
export class CapacityService {
  constructor(
    @Inject(Providers.CAPACITY_STRATEGY)
    private readonly strategy: CapacityStrategy,
  ) {}

  async getDailyCapacity(
    workMinutesPerDay: number = DEFAULT_WORK_MINUTES_PER_DAY,
  ): Promise<number> {
    return this.strategy.getMaxUnitsAvailable(workMinutesPerDay);
  }
}
