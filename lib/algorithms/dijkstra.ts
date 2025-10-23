// Dijkstra algorithm stepper (placeholder skeleton per REQUIREMENTS.md)
import type { Graph } from "../graph/types";

export type DistanceMap = Record<string, number>;
export type PredecessorMap = Record<string, string | null>;

export interface DijkstraState {
  current?: string;
  distances: DistanceMap;
  predecessors: PredecessorMap;
  frontier: string[];
  visited: Set<string>;
  done: boolean;
  path?: string[];
}

export class DijkstraStepper {
  private graph: Graph;
  private start: string;
  private end?: string;
  private state: DijkstraState;

  constructor(graph: Graph, start: string, end?: string) {
    this.graph = graph;
    this.start = start;
    this.end = end;
    // Initialize minimal state; actual logic to be implemented later
    const distances: DistanceMap = Object.fromEntries(graph.nodes.map(n => [n.id, Number.POSITIVE_INFINITY]));
    const predecessors: PredecessorMap = Object.fromEntries(graph.nodes.map(n => [n.id, null]));
    if (distances[start] !== undefined) distances[start] = 0;
    this.state = {
      current: undefined,
      distances,
      predecessors,
      frontier: [],
      visited: new Set<string>(),
      done: false,
      path: undefined,
    };
  }

  // Advance one step — not yet implemented
  next(): DijkstraState {
    // TODO: implement relaxation, priority queue extraction, and done detection
    return this.state;
  }

  getState(): DijkstraState {
    return this.state;
  }
}

