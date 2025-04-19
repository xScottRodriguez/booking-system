import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';
export class CreateBookingDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty({
    message: 'required service',
  })
  @IsNumber()
  serviceTypeId: number;

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty({
    message: 'required client',
  })
  @IsNumber()
  clientId: number;

  @ApiProperty({
    example: '2022-05-12',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in format YYYY-MM-DD',
  })
  date: string;

  @ApiProperty({
    example: '12:00:00',
    description: 'Time in HH:mm:ss format',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/)
  hour: string;
}
