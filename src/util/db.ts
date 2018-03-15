/**
 * Database connection module
 *
 * @author Evan MacGregor
 */
import { Pool, PoolClient } from 'pg';

import logger from './logger';

/**
 * Connect to Postgres
 *
 * Connection details handled by environment variables.
 */
const pool = new Pool();

/**
 * Handle query to Postgres
 */
const query = (text: string, params: Array<any>, next: Function) => {
  const start = Date.now();

  return pool.query(text, params, (err, res) => {
    const duration = Date.now() - start;

    logger.debug('executed query', {text, duration, rows: res.rowCount});
    next(err, res);
  });
};

/**
 * Request client from pool
 */
const getClient = (next: Function) => {
  pool.connect((err: Error, client: PoolClient, done: Function) => {
    next(err, client, done);
  });
};

const db = {
  pool,
  query,
  getClient
};

export default db;
