/**
 * Environment variable loader module
 *
 * @author Evan MacGregor
 */
import fs from 'fs';
import logger from './logger';
import dotenv from 'dotenv';

// Try to load environment variables from disk to process
try {
  fs.existsSync('.env');
  logger.debug(`Using .env file to supply application environment variables.`);
  dotenv.config({path: '.env'});
} catch (err) {
  logger.error(`.env file not found! Please create a .env file.`);
  process.exit(1);
}

/**
 * Define environment variables from loaded process variables
 */
export const SESSION_SECRET = process.env['SESSION_SECRET'];
export const ENVIRONMENT = process.env.NODE_ENV;

const prod = ENVIRONMENT === 'production';

export const PGUSER = process.env['PGUSER'];
export const PGPASSWORD = process.env['PGPASSWORD'];
export const HOST = prod ? process.env['HOST'] : process.env['LOCALHOST'];
export const PGDATABASE = process.env['PGDATABASE'];
export const PGPORT = process.env['PGPORT'];

// Check for existence of required environment variables
if (!SESSION_SECRET) {
  logger.error(`No session secret. Set SESSION_SECRET environment variable.`);
  process.exit(1);
}

if (!PGUSER) {
  logger.error(`No Postgres user. Set PGPORT environment variable.`);
  process.exit(1);
}

if (!PGPASSWORD) {
  logger.error(`No Postgres password. Set PGPASSWORD environment variable.`);
  process.exit(1);
}

if (!HOST) {
  logger.error(`No server host. Set HOST and LOCALHOST environment variables.`);
  process.exit(1);
}

if (!PGPORT) {
  logger.error(`No Postgres port. Set PGPORT environment variable.`);
  process.exit(1);
}

if (!PGDATABASE) {
  logger.error(`No Postgres database. Set PGDATABASE environment variable.`);
  process.exit(1);
}
