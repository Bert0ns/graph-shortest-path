import { Graph } from '../../graph/types';
import { PathfindingAlgorithm, TraceEvent } from '../types';

/**
 * Executes a pathfinding algorithm and captures its full execution history.
 * This function acts as a wrapper around a pure algorithm, allowing its step-by-step
 * execution to be recorded and later visualized.
 *
 * @param algorithm The pathfinding algorithm to execute.
 * @param graph The graph to run the algorithm on.
 * @param startId The ID of the starting node.
 * @param endId The ID of the ending node.
 * @returns An array of `TraceEvent` objects representing the algorithm's execution log.
 */
export const traceAlgorithm = (
  algorithm: PathfindingAlgorithm,
  graph: Graph,
  startId: string,
  endId: string
): TraceEvent[] => {
  const traceLog: TraceEvent[] = [];

  const trace: (event: TraceEvent) => void = (event) => {
    traceLog.push(event);
  };

  algorithm(graph, startId, endId, trace);

  return traceLog;
};
