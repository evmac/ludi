import bcrypt from 'bcrypt-nodejs';
import crypto from 'crypto';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsString,
  Length
} from 'class-validator';

class Account {
  @IsBoolean() isNew: boolean;

  @IsEmail() email: string;

  @IsString()
  @Length(3, 25)
  username: string;

  @IsString()
  @Length(8, 256)
  password: string;

  @IsString() passwordResetToken: string;

  @IsDate() passwordResetExpires: Date;

  @IsString() facebook: string;

  @IsArray() tokens: AuthToken[];

  pre(next: Function) {
    const user = this;

    if (!user.isModified()) next();

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, undefined, (err: Error, hash) => {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  }

  isModified() {
    return this.isNew;
  }

  checkPassword(candidate: string, next: Function) {
    bcrypt.compare(candidate, this.password, (err: Error, isMatch: boolean) => {
      next(err, isMatch);
    });
  }
}

export type AuthToken = {
  accessToken: string;
  type: string;
};

export default Account;
