import 'dotenv/config';
import * as Joi from 'joi';

interface IEnvSchema {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  DATABASE_URL: string;

  PORT: number;

  JWT_SECRET: string;

  JWT_EXPIRATION_TIME: string;

  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;

  API_BASE_URL: string;

  RESEND_API_KEY: string;
  SENDER_MAIL: string;

  APP_NAME: string;
}

const envSchema = Joi.object<IEnvSchema>({
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_DB: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),

  PORT: Joi.number().default(3000),

  JWT_SECRET: Joi.string().required(),

  JWT_EXPIRATION_TIME: Joi.string().default('1d'),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().required(),

  API_BASE_URL: Joi.string().default('http://localhost:3000'),

  RESEND_API_KEY: Joi.string().required(),
  SENDER_MAIL: Joi.string().required(),
  APP_NAME: Joi.string().default('MyApp'),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars = value;

export const envs = {
  postgresUser: envVars.POSTGRES_USER,
  postgresPassword: envVars.POSTGRES_PASSWORD,
  postgresHost: envVars.POSTGRES_HOST,
  postgresPort: envVars.POSTGRES_PORT,
  postgresDb: envVars.POSTGRES_DB,
  databaseUrl: envVars.DATABASE_URL,

  port: envVars.PORT,

  jwtSecret: envVars.JWT_SECRET,
  jwtExpirationTime: envVars.JWT_EXPIRATION_TIME,

  googleClientId: envVars.GOOGLE_CLIENT_ID,
  googleClientSecret: envVars.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: envVars.GOOGLE_CALLBACK_URL,

  apiBaseUrl: envVars.API_BASE_URL,

  resendApiKey: envVars.RESEND_API_KEY,
  senderMail: envVars.SENDER_MAIL,

  appName: envVars.APP_NAME,
};
