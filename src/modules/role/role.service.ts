import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { roles } from '@prisma/client';

import { RoleRepository } from './repository';

@Injectable()
export class RoleService {
  #logger = new Logger(RoleService.name);
  constructor(private readonly repository: RoleRepository) {}
  async getAll(): Promise<roles[]> {
    try {
      return await this.repository.getAll();
    } catch (error) {
      this.#logger.error(error.message);
      throw new InternalServerErrorException('Error trying find roles');
    }
  }

  async getOne(id: number): Promise<roles> {
    const role = await this.repository.getOne(id);

    if (!role) throw new NotFoundException('Role Not Found');

    return role;
  }

  getDefaultRole(defaultRole = 'AUTHENTICATED'): Promise<roles> {
    return this.repository.getDefaultRole(defaultRole);
  }
}
