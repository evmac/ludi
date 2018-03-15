/**
 * Logger module
 *
 * @author Evan MacGregor
 */
import winston, { Logger } from 'winston';
import { ENVIRONMENT } from './secrets';

/**
 * Create logger object and settings
 */
const logger = new (Logger)({
  transports: [
    new (winston.transports.Console)({level: ENVIRONMENT === 'production' ? 'error' : 'debug'}),
    new (winston.transports.File)({filename: 'debug.log', level: 'debug'})
  ]
});

// Enable debug logging if not in production environment
if (ENVIRONMENT !== 'production') {
  logger.debug(`Logger: ${ENVIRONMENT}`);
  logger.debug(`Logging initialized at debug level.`);
}

export default logger;
