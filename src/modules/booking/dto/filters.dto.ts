import { ApiPropertyOptional } from '@nestjs/swagger';

import { ReservationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

export class FiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by date',
    type: 'string',
    format: 'date-time',
    example: '2023-10-01',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'toDate must be in format YYYY-MM-DD',
  })
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by date',
    type: 'string',
    format: 'date-time',
    example: '2023-10-01',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'toDate must be in format YYYY-MM-DD',
  })
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by service type id',
    type: 'number',
    example: 1,
  })
  @IsOptional()
  @IsString()
  serviceType?: string;

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
