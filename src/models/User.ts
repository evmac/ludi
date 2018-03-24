/**
 * User model
 *
 * @author Evan MacGregor
 */
import _ from 'lodash';
import { Moment } from 'moment';
import bcrypt from 'bcrypt-nodejs';

import * as db from '../util/db';

import Game from './Game';

export type AuthToken = {
  accessToken: string;
  type: string;
};

export class Player {
  public id: number;
}

export default class User extends Player {
  public email: string;
  public name: string;
  public username: string;
  public password: string;
  public avatar?: URL;
  public location?: string;

  public passwordResetToken: AuthToken;
  public passwordResetExpires: Moment;

  public facebook?: string;
  public google?: string;

  public tokens: Array<AuthToken>;

  public games: Array<Game>;

  populate(map: Object): void {
    // this.id = map.id;
    // TODO: expand this properly
  }

  getParams(): Array<any> {
    return; // Array of all values to save
  }

  checkPassword(candidate: string, next: Function): void {
    bcrypt.compare(candidate, this.password, (err: Error, isMatch: boolean) => {
      next(err, isMatch);
    });
  }

  save(next: Function): void {
    const sql = '';

    bcrypt.genSalt(10, (err: Error, salt: string) => {
      if (err) {
        throw err;
      }

      bcrypt.hash(
        this.password,
        salt,
        undefined,
        (err: Error, hash: string) => {
          if (err) {
            next(err);
          }

          this.password = hash;
          next();
        }
      );
    });

    db.query(sql, this.getParams(), (err: Error, res: object) => {
      if (err) {
        next(err);
      }
      next(undefined, res);
    });
  }

  static find(params: Array<any>, next: Function): void {
    const sql = ''; // TODO: Add SQL

    db.query(sql, params, (err: Error, res: object) => {
      if (err) {
        next(err);
      }
      if (!_.isEmpty(res)) {
        const user = new User();
        user.populate(res);
        next(undefined, user);
      }
    });
  }

  delete(next: Function): void {
    const sql = ''; // TODO: Add SQL

    db.query(sql, [this.id], (err: Error, res: object) => {
      if (err) {
        next(err);
      }
      next(undefined, res);
    });
  }

}