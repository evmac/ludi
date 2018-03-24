/**
 * User controller
 *
 * @author Evan MacGregor
 */
import async from 'async';
import crypto from 'crypto';
import moment from 'moment';
import nodemailer from 'nodemailer';
import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { IVerifyOptions } from 'passport-local';

const request = require('express-validator');

import User, { AuthToken } from '../models/User';

/**
 * GET /login
 *
 * Login page.
 */
export let getLogin = (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect('/');
  }
  // res.render('account/login', {
  //   title: 'Login'
  // });
  // TODO: Update with React SSR
};

/**
 * POST /login
 *
 * Sign in using email and password.
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate(
    'local',
    (err: Error, user: User, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('errors', info.message);
        return res.redirect('/login');
      }
      req.logIn(user, err => {
        if (err) {
          return next(err);
        }
        req.flash('success', { msg: 'Success! You are logged in.' });
        res.redirect(req.session.returnTo || '/');
      });
    }
  )(req, res, next);
};

/**
 * GET /logout
 *
 * Log out.
 */
export let logout = (req: Request, res: Response) => {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 *
 * Signup page.
 */
export let getSignup = (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect('/');
  }
  // res.render('account/signup', {
  //   title: 'Create User'
  // });
  // TODO: Update with React SSR
};

/**
 * POST /signup
 *
 * Create a new local account.
 */
export let postSignup = (req: Request, res: Response, next: NextFunction) => {
  req.assert('email', 'Email is not valid.').isEmail();
  req
    .assert('password', 'Password must be at least 8 characters long.')
    .len({ min: 8 });
  req
    .assert('confirmPassword', 'Passwords do not match')
    .equals(req.body.password);
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  User.find([req.body.email, req.body.username], (err: Error, user: User) => {
    if (err) {
      throw err;
    }
    if (user) {
      req.flash('errors', errors);

      return res.redirect('/signup');
    }
    user.save((err: Error) => {
      if (err) {
        return next(err);
      }
      req.logIn(user, err => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
};

/**
 * GET /account
 *
 * Profile page.
 */
export let getAccount = (req: Request, res: Response) => {
  // res.render('account/profile', {
  //   title: 'Your Profile'
  // });
  // TODO: Update with React SSR
};

/**
 * POST /account/profile
 *
 * Update profile information.
 */
export let postUpdateProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.find([req.user.id], (err: Error, user: User) => {
    if (err) {
      return next(err);
    }

    user.email = req.body.email || '';
    user.username = req.body.username || '';
    user.password = req.body.password || '';
    user.save((err: Error) => {
      if (err) {
        req.flash('errors', {
          msg:
            'The email address you have entered is already associated with an account.'
        });
        return res.redirect('/account');
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 *
 * Update current password.
 */
export let postUpdatePassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req
    .assert('password', 'Password must be at least 4 characters long')
    .len({ min: 4 });
  req
    .assert('confirmPassword', 'Passwords do not match')
    .equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.find([req.user.id], (err: Error, user: User) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user.save((err: Error) => {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 *
 * Delete user account.
 */
export let postDeleteAccount = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  User.find([req.user.id], (err: Error, user: User) => {
    if (err) {
      return next(err);
    }
    user.delete((err: Error) => {
      if (err) {
        return next(err);
      }
      req.logout();
      req.flash('info', { msg: 'Your account has been deleted.' });
      res.redirect('/');
    });
  });
};

/**
 * GET /account/unlink/:provider
 *
 * Unlink OAuth provider.
 */
export let getOauthUnlink = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const provider: keyof User = req.params.provider;

  User.find([req.user.id], (err: Error, user: User) => {
    if (err) {
      return next(err);
    }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(
      (token: AuthToken) => token.type !== provider
    );
    user.save((err: Error) => {
      if (err) {
        return next(err);
      }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 *
 * Reset Password page.
 */
export let getReset = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  User.find([req.params.token, moment()], (err: Error, user: User) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('errors', {
        msg: 'Password reset token is invalid or has expired.'
      });
      return res.redirect('/forgot');
    }
    // res.render('account/reset', {
    //   title: 'Password Reset'
    // });
    // TODO: Update with React SSR
  });
};

/**
 * POST /reset/:token
 *
 * Process the reset password request.
 */
export let postReset = (req: Request, res: Response, next: NextFunction) => {
  req
    .assert('password', 'Password must be at least 4 characters long.')
    .len({ min: 8 });
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall(
    [
      function resetPassword(done: Function) {
        User.find([req.params.token, moment()], (err: Error, user: User) => {
          if (err) {
            return next(err);
          }
          if (!user) {
            req.flash('errors', {
              msg: 'Password reset token is invalid or has expired.'
            });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err: Error) => {
            if (err) {
              return next(err);
            }
            req.logIn(user, err => {
              done(err, user);
            });
          });
        });
      },
      function sendResetPasswordEmail(user: User, done: Function) {
        const transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD
          }
        });
        const mailOptions = {
          to: user.email,
          from: 'express-ts@starter.com',
          subject: 'Your password has been changed',
          text: `Hello,\n\nThis is a confirmation that the password for your account ${
            user.email
          } has just been changed.\n`
        };
        transporter.sendMail(mailOptions, (err: Error) => {
          req.flash('success', {
            msg: 'Success! Your password has been changed.'
          });
          done(err);
        });
      }
    ],
    err => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    }
  );
};

/**
 * GET /forgot
 *
 * Forgot Password page.
 */
export let getForgot = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  // res.render('account/forgot', {
  //   title: 'Forgot Password'
  // });
  // TODO: Update with React SSR
};

/**
 * POST /forgot
 *
 * Create a random token, then send the user an email with a reset link.
 */
export let postForgot = (req: Request, res: Response, next: NextFunction) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall(
    [
      function createRandomToken(done: Function) {
        crypto.randomBytes(16, (err, buf) => {
          const token = buf.toString('hex');
          done(err, token);
        });
      },
      function setRandomToken(token: AuthToken, done: Function) {
        User.find([req.body.email], (err: Error, user: User) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            req.flash('errors', {
              msg: 'User with that email address does not exist.'
            });
            return res.redirect('/forgot');
          }
          user.passwordResetToken = token;
          user.passwordResetExpires = moment().add(1, 'hours');
          user.save((err: Error) => {
            done(err, token, user);
          });
        });
      },
      function sendForgotPasswordEmail(
        token: AuthToken,
        user: User,
        done: Function
      ) {
        const transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD
          }
        });
        const mailOptions = {
          to: user.email,
          from: 'admin@evmac.tech',
          subject: 'Reset your password for Prince',
          text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };
        transporter.sendMail(mailOptions, err => {
          req.flash('info', {
            msg: `An e-mail has been sent to ${
              user.email
            } with further instructions.`
          });
          done(err);
        });
      }
    ],
    err => {
      if (err) {
        return next(err);
      }
      res.redirect('/forgot');
    }
  );
};
