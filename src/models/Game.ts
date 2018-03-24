/**
 * Game model
 *
 * @author Evan MacGregor
 */
import Board from './Board';
import State from './State';
import { Player } from './User';

import * as db from '../util/db';

export default class Game {
  public id: number;
  public string: number;
  public board: Board;
  public states: Array<State>;
  public players: Array<Player>;
  public isComplete: boolean;

  public addPlayer(player: Player, next: Function): void {
    const sql = ''; // TODO: Add SQL

    db.query(sql, [player], (err: Error, res: object) => {
      if (err) {
        next(err);
      }
      next(undefined, res);
    });
  }

  public removePlayer(id: number, next: Function) {
    const sql = ''; // TODO: Add SQL

    db.query(sql, [id], (err: Error, res: object) => {
      if (err) {
        next(err);
      }
      next(undefined, res);
    });
  }
}
