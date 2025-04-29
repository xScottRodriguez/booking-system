import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from '@root/src/common/enums';
import { RoleAuthGuard } from '@root/src/common/guards';
import { PaginationQueryDto } from '@root/src/common/interfaces';
import { IPagination } from '@root/src/common/interfaces/pagination.interface';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(
  AuthGuard('jwt'),
  new RoleAuthGuard(Roles.ADMIN, Roles.AUTHENTICATED),
)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto): string {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationQueryDto<{ name: string }>,
  ): Promise<IPagination<{ name: string }>> {
    return this.servicesService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): string {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return this.servicesService.remove(+id);
  }
}
