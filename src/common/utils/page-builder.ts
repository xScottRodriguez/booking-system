import { InternalServerErrorException } from '@nestjs/common';

import {
  IPagination,
  IPaginationOptionsPro,
  IPrismaModel,
} from '../interfaces/pagination.interface';
interface IResponse {
  take: number;
  skip: number;
}
const pageBuilder = async <
  T,
  SelectInput,
  WhereInput,
  OrderInput,
  IncludeInput,
>(
  model: IPrismaModel<T>,
  options: IPaginationOptionsPro<
    WhereInput,
    SelectInput,
    OrderInput,
    IncludeInput
  >,
): Promise<IPagination<T>> => {
  try {
    const {
      limit = 10,
      page = 1,
      where = {},
      select = undefined,
      include = undefined,
      orderBy = undefined,
    } = options;
    const { skip, take } = getTakeAndSkip(limit, page);

    const [data, total] = await Promise.all([
      model.findMany({
        skip: +skip,
        take: +take,
        where,
        select,
        include,
        orderBy,
      }),
      model.count({ where }),
    ]);

    const next: number | null = total > take + skip ? page + 1 : null;
    const prev: number | null = skip > 0 ? page - 1 : null;
    const count: number = Math.ceil(total / take);

    return {
      data,
      total,
      page: {
        next,
        prev,
        count,
      },
    };
  } catch (error) {
    console.error({
      message: 'Error al intentar realizar la busqueda',
      error,
      options,
    });
    throw new InternalServerErrorException(
      'Error al intentar realizar la busqueda',
    );
  }
};

export const getTakeAndSkip = (limit: number, page: number): IResponse => {
  const offset = (page - 1) * limit;
  return {
    take: limit,
    skip: offset,
  };
};
export default pageBuilder;
