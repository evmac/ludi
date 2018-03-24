import Node from '../models/Node';

interface Graph<T> {
  constructor(serialized: JSON): Graph<T>;

  addNode(node: Node): Graph<T>;
  removeNode(node: Node): Graph<T>;

  addEdge(u: Node, v: Node, weight: number): Graph<T>;
  removeEdge(u: Node, v: Node): Graph<T>;

  getEdgeWeight(u: Node, v: Node, weight: number): Graph<T>;
  setEdgeWeight(u: Node, v: Node, weight: number): Graph<T>;

  nodes(): Array<Node>;
  adjacent(node: Node): Array<string>;
  indegree(node: Node): number;
  outdegree(node: Node): number;

  serialize(): JSON;
  deserialize(graph: Graph<T>): Graph<T>;

  depthFirstSearch(
    sourceNodes: Array<Node>,
    includeSourceNodes: boolean
  ): Array<Node>;
  topologicalSort(
    sourceNodes: Array<Node>,
    includeSourceNodes: boolean
  ): Array<Node>;
  shortestPath(sourceNode: Node, destinationNode: Node): Array<Node>;
}

declare module 'graph-data-structure';