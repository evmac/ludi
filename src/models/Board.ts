import { Graph } from 'graph-data-structure';

import Node from '../models/Node';
import Unit from '../models/Unit';

export default class Board {
  public variant: string;
  public graph: Graph<Node>;
  public units: Array<Unit>;
}