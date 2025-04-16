export interface CapacityStrategy {
  getMaxUnitsAvailable(workMinutesPerDay: number): Promise<number>;
}
