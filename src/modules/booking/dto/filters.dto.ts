import { ApiPropertyOptional } from '@nestjs/swagger';

import { ReservationStatus } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

export class FiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by date',
    type: 'string',
    format: 'date-time',
    example: '2023-10-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by date',
    type: 'string',
    format: 'date-time',
    example: '2023-10-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by service type id',
    type: 'number',
    example: 1,
  })
  @IsOptional()
  @IsString()
  serviceTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by reservation status',
    enum: ReservationStatus,
    example: ReservationStatus.confirmada,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus = ReservationStatus.confirmada;
  @ApiPropertyOptional({
    description: 'Filter by client id',
    type: 'number',
    example: 1,
  })
  @IsOptional()
  @IsString()
  clientId?: string;
}
