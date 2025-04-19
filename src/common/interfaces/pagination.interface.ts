import { Prisma } from '@prisma/client';
import { Sql } from '@prisma/client/runtime/library';

interface IPaginationOptions<T = unknown, U = unknown> {
  limit?: number;
  page?: number;
  where: T;
  select?: U;
  orderBy?: Prisma.SortOrder;
}

interface IPaginationOptionsPro<
  WhereInput,
  SelectInput,
  OrderByInput = unknown,
  IncludeInput = unknown,
> {
  limit?: number;
  page?: number;
  where?: WhereInput;
  select?: SelectInput;
  orderBy?: OrderByInput;
  include?: IncludeInput;
}

interface IPaginationOptionsRaw {
  query: Sql;
  limit?: number;
  page?: number;
}
interface IPageResponse {
  prev: number | null;
  next: number | null;
  count: number;
}

interface IPagination<T> {
  data: T[];
  total: number;
  page: IPageResponse;
}

interface IPrismaModel<T> {
  findMany: (args?: object) => Prisma.PrismaPromise<T[]>;
  count: (args?: object) => Prisma.PrismaPromise<number>;
}
interface IRepositoriesPaginations<T> {
  filters: T;
  limit: number;
  page: number;
}

export {
  IPagination,
  IPageResponse,
  IPrismaModel,
  IPaginationOptions,
  IRepositoriesPaginations,
  IPaginationOptionsRaw,
  IPaginationOptionsPro,
};
