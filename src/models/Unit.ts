import Node from '../models/Node';

import * as db from '../util/db';

export default class Unit {
  public id: number;
  public name: string;
  public power: number;
  public status: string;
  public position: Node;

  public move(newPosition: Node, next: Function): void {
    if (
      this.position.hasAdjacent(newPosition)
    ) {
      const sql = ''; // TODO: Add SQL

      db.query(sql, [this.id], (err: Error, res: object) => {
        if (err) {
          next(err);
        }
        next(undefined, res);
      });
    } else {
      next(undefined, false);
    }
  }

  public static create(next: Function): void {}

  public static find(params: Array<any>, next: Function): void {}

  public delete(next: Function): void {}
}
