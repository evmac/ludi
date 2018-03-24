/**
 * Passport strategies
 *
 * @author Evan MacGregor
 */
import _ from 'lodash';
import passport, { Profile } from 'passport';
import request from 'request';
import Local from 'passport-local';
import Facebook from 'passport-facebook';
import Google from 'passport-google-oauth';

import User, { AuthToken } from '../models/User';
import { Request, Response, NextFunction } from 'express';

const LocalStrategy = Local.Strategy;
const FacebookStrategy = Facebook.Strategy;
const GoogleStrategy = Google.OAuth2Strategy;

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.find([id], (err: Error, user: User) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.find([email.toLowerCase()], (err: Error, user: User) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(undefined, false, { message: `Email ${email} not found.` });
      }

      user.checkPassword(password, (err: Error, isMatch: boolean) => {
        if (err) {
          return done(err);
        }

        if (isMatch) {
          return done(undefined, user);
        }

        return done(undefined, false, {
          message: 'Invalid email or password.'
        });
      });
    });
  })
);

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Facebook.
 */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
      passReqToCallback: true
    },
    (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: Facebook.Profile,
      done: Function
    ) => {
      if (req.user) {
        User.find([profile.id], (err: Error, existingUser: User) => {
          if (err) {
            return done(err);
          }

          if (existingUser) {
            req.flash('errors', {
              msg: `There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.`
            });
            done(err);
          } else {
            User.find([req.user.id], (err: Error, user: User) => {
              if (err) {
                return done(err);
              }

              user.facebook = profile.id;
              user.tokens.push({ type: 'facebook', accessToken });
              user.name = user.name || profile.displayName;
              user.avatar =
                user.avatar ||
                new URL(
                  `https://graph.facebook.com/${profile.id}/picture?type=large`
                );

              user.save((err: Error) => {
                req.flash('info', { msg: 'Facebook account has been linked.' });
                done(err, user);
              });
            });
          }
        });
      } else {
        User.find([profile.id], (err: Error, existingUser: User) => {
          if (err) {
            return done(err);
          }

          if (existingUser) {
            return done(undefined, existingUser);
          }

          User.find([profile._json.email], (err: Error, existingEmailUser: User) => {
            if (err) {
              return done(err);
            }

            if (existingEmailUser) {
              req.flash('errors', {
                msg:
                  'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.'
              });
              done(err);
            } else {
              const user: any = new User();

              user.email = profile._json.email;
              user.facebook = profile.id;
              user.tokens.push({ type: 'facebook', accessToken });
              user.profile.name = profile.displayName;
              user.profile.gender = profile._json.gender;
              user.profile.picture = `https://graph.facebook.com/${
                profile.id
              }/picture?type=large`;
              user.profile.location = profile._json.location
                ? profile._json.location.name
                : '';
              user.save((err: Error) => {
                done(err, user);
              });
            }
          });
        });
      }
    }
  )
);

/**
 * Sign in with Google.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true
    },
    (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: Google.Profile,
      done: Function
    ) => {
      if (req.user) {
        User.find([profile.id], (err: Error, existingUser: User) => {
          if (err) {
            return done(err);
          }

          if (existingUser) {
            req.flash('errors', {
              msg: `There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.`
            });
            done(err);
          } else {
            User.find([req.user.id], (err: Error, user: User) => {
              if (err) {
                return done(err);
              }

              user.google = profile.id;
              user.tokens.push({ type: 'google', accessToken });
              user.name = user.name || profile.displayName;
              user.avatar =
                profile.photos && profile.photos.length
                  ? new URL(profile.photos[0].value)
                  : undefined;

              user.save((err: Error) => {
                req.flash('info', { msg: 'Google account has been linked.' });
                done(err, user);
              });
            });
          }
        });
      } else {
        User.find([profile.id], (err: Error, existingUser: User) => {
          if (err) {
            return done(err);
          }

          if (existingUser) {
            return done(undefined, existingUser);
          }

          User.find([profile._json.email], (err: Error, existingEmailUser: User) => {
            if (err) {
              return done(err);
            }

            if (existingEmailUser) {
              req.flash('errors', {
                msg:
                  'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.'
              });
              done(err);
            } else {
              const user = new User();

              user.email = profile._json.email;
              user.google = profile.id;
              user.tokens.push({ type: 'google', accessToken });
              user.name = profile.displayName;
              user.avatar =
                profile.photos && profile.photos.length
                  ? new URL(profile.photos[0].value)
                  : undefined;
              user.location = profile._json.location
                ? profile._json.location.name
                : '';
              user.save((err: Error) => {
                done(err, user);
              });
            }
          });
        });
      }
    }
  )
);

/**
 * Login Required middleware.
 */
export let isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
export let isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
