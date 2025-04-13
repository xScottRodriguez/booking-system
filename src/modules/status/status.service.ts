import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common/services';

import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class StatusService {
  #logger = new Logger(StatusService.name);
  constructor() {}

  async create(_createStatusDto: CreateStatusDto) {
    // const stateToSave = this.stateRepository.create(createStatusDto);
    //
    // try {
    //   return await this.stateRepository.save(stateToSave);
    // } catch (error) {
    //   if (error.code === '23505')
    //     throw new ConflictException('This state is already registered');
    //   this.#logger.error(error.message);
    //
    //   throw new InternalServerErrorException('Error trying create state');
    // }
  }

  async findAll() {
    // try {
    //   return await this.stateRepository.find();
    // } catch (error) {
    //   throw new InternalServerErrorException('Error trying find states');
    // }
  }

  async findOne(_id: number) {
    // const state = await this.stateRepository.findOneBy({ id });
    //
    // if (!state) throw new NotFoundException('State not found');
    //
    // return state;
  }

  async update(_id: number, _updateStatusDto: UpdateStatusDto) {
    // await this.findOne(id);
    //
    // try {
    //   return await this.stateRepository
    //     .createQueryBuilder()
    //     .update(Status)
    //     .set(updateStatusDto)
    //     .execute();
    // } catch (error) {
    //   throw new InternalServerErrorException('Error trying update service');
    // }
  }

  async remove(_id: number) {
    // await this.findOne(id);
    //
    // try {
    //   await this.stateRepository
    //     .createQueryBuilder('status')
    //     .delete()
    //     .from(Status)
    //     .where('id=:id', { id })
    //     .execute();
    // } catch (error) {
    //   throw new InternalServerErrorException('Error trying delete state');
    // }
  }
}
