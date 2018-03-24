/**
 * Database connection module
 *
 * @author Evan MacGregor
 */
import { Pool, PoolClient } from 'pg';
import moment from 'moment';

import logger from './logger';

// Connect to Postgres
// Connection details handled by environment variables.
const pool = new Pool();

// Close connection on Postgres error
pool.on('error', (err, client) => {
  logger.error(`Unexpected error on idle client`, err);
  process.exit(-1);
});

/**
 * Close Postgres connection
 */
export let close = async () => {
  logger.debug(`Closing Postgres connection...`);
  await pool.end();
  logger.debug(`Postgres connection closed.`);
};

/**
 * Handle query to Postgres
 */
export let query = async (sql: string, params: Array<any>, next: Function) => {
  const start = moment();
  logger.debug(`Starting async query at ${start.toLocaleString()}`);

  await pool
    .query(sql, params)
    .then(res => {
      const duration = moment().diff(start);
      logger.debug(
        `Executed query ${sql}; T+${duration} for ${res.rowCount} rows.`
      );
      next(undefined, res);
    })
    .catch(err => {
      next(err);
    });
};

/**
 * Request client from pool
 */
export let getClient = (next: Function) => {
  pool.connect((err: Error, client: PoolClient, done: Function) => {
    next(err, client, done);
  });
};
