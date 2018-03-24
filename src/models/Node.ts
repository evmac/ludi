import _ from 'lodash';

import Unit from '../models/Unit';

export default class Node {
  public id: number;
  public cost: number;
  public nodes: Array<Node>;
  public unit: Unit;

  public hasAdjacent(node: Node): boolean {
    return _.some(this.nodes, node);
  }

  public hasUnit(): boolean {
    return !_.isNil(this.unit);
  }
}