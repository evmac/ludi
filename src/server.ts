/**
 * Server init module
 *
 * @author Evan MacGregor
 */
import errorHandler from 'errorhandler';

import app from './app';
import logger from './util/logger';

app.use(errorHandler());

const server = app.listen(app.get('port'), () => {
  logger.info(
    `Ludi ${app.get('env')} server running at http://${app.get(
      'host'
    )}:${app.get('port')}.\n`
  );
  logger.info(`CTRL+C to quit.\n`);
});

export default server;
