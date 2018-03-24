import Unit from '../models/Unit';
import Node from '../models/Node';
import Board from '../models/Board';

export default class Action {
  public id: number;
  public type: string;
  public unit: Unit;
  public nodes: Array<Node>;

  public apply(board: Board): void {}
}