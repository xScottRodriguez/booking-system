import { Injectable } from '@nestjs/common';

import { ServiceType } from '@prisma/client';
import { PaginationQueryDto } from '@root/src/common/interfaces';
import { IPagination } from '@root/src/common/interfaces/pagination.interface';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceRepository } from './repository';

@Injectable()
export class ServicesService {
  constructor(private readonly _serviceRepository: ServiceRepository) {}
  create(_createServiceDto: CreateServiceDto): string {
    return 'This action adds a new service';
  }

  findAll(
    pagination: PaginationQueryDto<{ name: string }>,
  ): Promise<IPagination<ServiceType>> {
    return this._serviceRepository.findAll(pagination);
  }

  findOne(id: number): string {
    return `This action returns a #${id} service`;
  }

  update(id: number, _updateServiceDto: UpdateServiceDto): string {
    return `This action updates a #${id} service`;
  }

  remove(id: number): string {
    return `This action removes a #${id} service`;
  }
}
