import { PartialType } from '@nestjs/swagger';

import { IsPhoneNumber } from 'class-validator';

import { CreateAuthDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsPhoneNumber('SV')
  phoneNumber: string;
}
