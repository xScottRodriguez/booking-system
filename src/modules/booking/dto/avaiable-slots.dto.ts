import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, IsString } from 'class-validator';

export class AvailableSlotsDto {
  @ApiProperty({
    description: 'Date of the available slots',
    type: String,
    example: '2023-10-01',
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Service ID for which the slots are available',
    type: Number,
    example: 1,
  })
  @IsNumber()
  serviceId: number;
}
