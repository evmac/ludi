/**
 * Server app module
 *
 * @author Evan MacGregor
 */
import dotenv from 'dotenv';
import { Pool } from 'pg';
import express from 'express';
import path from 'path';
import compression from 'compression';
import bodyParser from 'body-parser';
import expressValidator from 'express-validator';
import session from 'express-session';
import lusca from 'lusca';

import db from './util/db';
import logger from './util/logger';
import { SESSION_SECRET } from './util/secrets';

// Load environment variables from .env
dotenv.config({ path: '.env' });

// Load route handlers
import * as homeController from './controllers/Home';
import * as accountController from './controllers/Account';
import * as userController from './controllers/User';
import * as gameController from './controllers/Game';
import * as apiController from './controllers/Api';

// Load Passport config and API keys
import * as passportConfig from './config/passport';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET
  })
);
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (
    !req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)
  ) {
    req.session.returnTo = req.path;
  } else if (req.user && req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
);

// App routes
app.get('/', homeController.index);
app.get('/login', accountController.getLogin);
app.post('/login', accountController.postLogin);
app.get('/logout', accountController.logout);
app.get('/forgot', accountController.getForgot);
app.post('/forgot', accountController.postForgot);
app.get('/reset/:token', accountController.getReset);
app.post('/reset/:token', accountController.postReset);
app.get('/signup', accountController.getSignup);
app.post('/signup', accountController.postSignup);
app.get(
  '/account',
  passportConfig.isAuthenticated,
  accountController.getAccount
);
app.post(
  '/account/profile',
  passportConfig.isAuthenticated,
  accountController.postUpdateProfile
);
app.post(
  '/account/password',
  passportConfig.isAuthenticated,
  accountController.postUpdatePassword
);
app.post(
  '/account/delete',
  passportConfig.isAuthenticated,
  accountController.postDeleteAccount
);
app.get(
  '/account/unlink/:provider',
  passportConfig.isAuthenticated,
  accountController.getOauthUnlink
);

// Ludi routes
app.get('/user/:name', userController.getUser);
app.get('/game/:id', gameController.getGame);

// App API routes
app.get('/api', apiController.getApi);

// Ludi API routes
app.get('/api/game/:id', apiController.forwardGetGame);
app.post('/api/game/action', apiController.forwardPostAction);

// OAuth authentication routes
// TODO: Write OAuth handlers for Google and Facebook

export default app;
