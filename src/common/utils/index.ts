import { readFile } from 'fs/promises';
import { join } from 'path';

import Handlebars from 'handlebars';
import { DateTime } from 'luxon';

import { OrderType } from '../enums';
import { PaginationQueryDto } from '../interfaces';
type MessageObject = {
  [key: string]: string | MessageObject;
};
let cachedMessages: MessageObject | null = null;
const loadMessages = async (): Promise<MessageObject> => {
  if (!cachedMessages) {
    const filePath = join(__dirname, '../lang/es.json');
    const data = await readFile(filePath, 'utf8');
    cachedMessages = JSON.parse(data);
  }
  return cachedMessages;
};
const getMessage = async (key: string): Promise<string> => {
  const messages = await loadMessages();
  const keys = key.split('.');
  let value: string | MessageObject = messages;

  for (const k of keys) {
    value = (value as MessageObject)[k];
    if (value === undefined) {
      throw new Error(`La key "${key}" no existe en los mensajes`);
    }
  }

  if (typeof value !== 'string') {
    throw new Error(`La key "${key}" no apunta a un string`);
  }

  return value;
};

async function compileTemplate(
  template: string,
  data: Record<string, unknown>,
): Promise<string> {
  const templatePath = join(__dirname, '../templates', `${template}.hbs`);

  const templateContent = await readFile(templatePath, 'utf8');
  const compiled = Handlebars.compile(templateContent);
  return compiled(data);
}

function parsePagination<T = unknown>(
  query: PaginationQueryDto<T>,
): PaginationQueryDto<T> {
  const filters: Record<string, unknown> = {};

  for (const key in query) {
    const match = key.match(/^filters\[(.+?)]$/);
    if (match) {
      filters[match[1]] = query[key];
    }
  }

  return {
    page: query.page ? query.page : 1,
    limit: query.limit ? query.limit : 25,
    offset: query.offset ? query.offset : 0,
    order: query.order ?? OrderType.ASC,
    filters: filters as T,
  };
}

function toUTCFromSV(dateStr: string, isEndOfDay = false): Date {
  const local = DateTime.fromISO(dateStr, { zone: 'America/El_Salvador' });
  const target = isEndOfDay ? local.endOf('day') : local.startOf('day');
  return target.toUTC().toJSDate(); // convierte a Date en UTC
}

function toISOFromSV(dateStr: string, isEndOfDay = false): Date {
  const local = DateTime.fromISO(dateStr, { zone: 'America/El_Salvador' });
  const target = isEndOfDay ? local.endOf('day') : local.startOf('day');
  return target.toJSDate(); // convierte a Date en UTC
}

export * from './page-builder';

export {
  getMessage,
  compileTemplate,
  parsePagination,
  toUTCFromSV,
  toISOFromSV,
};
