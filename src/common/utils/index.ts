import { readFile } from 'fs/promises';
import { join } from 'path';

import Handlebars from 'handlebars';
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

export * from './page-builder';

export { getMessage, compileTemplate };
