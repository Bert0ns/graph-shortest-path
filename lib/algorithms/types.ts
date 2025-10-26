import { Graph } from '../graph/types';

/**
 * Represents a single step in the execution of a pathfinding algorithm.
 * - 'visit': A node is being visited.
 * - 'relax': An edge is being relaxed (a shorter path to a neighbor is found).
 * - 'finish': The algorithm has finished.
 */
export type TraceEvent =
  | { type: 'visit'; nodeId: string; distance: number }
  | { type: 'relax'; fromId: string; toId: string; newDistance: number }
  | { type: 'finish'; path: string[]; totalDistance: number };

/**
 * A function that the algorithm calls to report its progress.
 */
export type TraceFunction = (event: TraceEvent) => void;

/**
 * The final result of a pathfinding algorithm.
 */
export interface PathfindingResult {
  path: string[];
  distances: Record<string, number>;
}

/**
 * A generic interface for a pathfinding algorithm.
 * It takes the graph, start/end nodes, and a trace callback, and returns the final result.
 */
export type PathfindingAlgorithm = (
  graph: Graph,
  startId: string,
  endId: string,
  trace: TraceFunction
) => PathfindingResult;
