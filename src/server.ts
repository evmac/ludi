import errorHandler from 'errorhandler';

import app from './app';

app.use(errorHandler());

const server = app.listen(app.get('port'), () => {
  console.log(`Ludi ${app.get('env')} server running at http://${app.get('host')}:${app.get('port')}.\n`);
  console.log(`CTRL+C to quit.\n`);
});

export default server;
