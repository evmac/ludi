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
import flash from 'express-flash';
import expressValidator from 'express-validator';
import session from 'express-session';
import lusca from 'lusca';
import passport from 'passport';

import * as db from './util/db';
import logger from './util/logger';
import { SESSION_SECRET } from './util/secrets';

// Load environment variables from .env
dotenv.config({ path: '.env' });

// Load Passport config and API keys
import * as passportConfig from './config/passport';

// Load controllers
import * as homeController from './controllers/Home';
import * as userController from './controllers/User';
import * as gameController from './controllers/Game';
import * as apiController from './controllers/Api';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jsx');

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
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
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post(
  '/account/profile',
  passportConfig.isAuthenticated,
  userController.postUpdateProfile
);
app.post(
  '/account/password',
  passportConfig.isAuthenticated,
  userController.postUpdatePassword
);
app.post(
  '/account/delete',
  passportConfig.isAuthenticated,
  userController.postDeleteAccount
);
app.get(
  '/account/unlink/:provider',
  passportConfig.isAuthenticated,
  userController.getOauthUnlink
);

// Ludi routes
// app.get('/user/:name', userController.getUser);
app.get('/game/:id', gameController.getGame);

// App API routes
app.get('/api', apiController.getApi);

// Ludi API routes
app.get('/api/game/:id', apiController.forwardGetGame);
app.post('/api/game/action', apiController.forwardPostAction);

// OAuth authentication routes
app.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);
app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(req.session.returnTo || '/');
  }
);
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'public_profile'] })
);
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(req.session.returnTo || '/');
  }
);

export default app;
