import { PathfindingAlgorithm } from '../types';

/**
 * An implementation of Dijkstra's algorithm that is completely decoupled from the UI.
 * It follows the `PathfindingAlgorithm` interface and uses a `trace` callback to report its progress.
 */
export const dijkstra: PathfindingAlgorithm = (graph, startId, endId, trace) => {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const pq: Set<string> = new Set();

  for (const node of graph.nodes) {
    const nodeId = node.id;
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    pq.add(nodeId);
  }

  distances[startId] = 0;

  while (pq.size > 0) {
    let closestNodeId = ' ';
    let smallestDistance = Infinity;

    for (const nodeId of pq) {
      if (distances[nodeId] < smallestDistance) {
        smallestDistance = distances[nodeId];
        closestNodeId = nodeId;
      }
    }

    if (closestNodeId === endId) break;
    if (closestNodeId === ' ' || smallestDistance === Infinity) break;

    pq.delete(closestNodeId);
    trace({ type: 'visit', nodeId: closestNodeId, distance: smallestDistance });

    const neighbors = graph.edges.filter((edge) => edge.from === closestNodeId);

    for (const neighborEdge of neighbors) {
      const newDist = smallestDistance + neighborEdge.weight;
      if (newDist < distances[neighborEdge.to]) {
        distances[neighborEdge.to] = newDist;
        previous[neighborEdge.to] = closestNodeId;
        trace({ type: 'relax', fromId: closestNodeId, toId: neighborEdge.to, newDistance: newDist });
      }
    }
  }

  const path: string[] = [];
  let current: string | null = endId;
  while (current && previous[current]) {
    path.unshift(current);
    current = previous[current];
  }

  if (path.length > 0 || startId === endId) {
    path.unshift(startId);
  }

  const totalDistance = distances[endId] === Infinity ? 0 : distances[endId];

  trace({ type: 'finish', path, totalDistance });

  return { path, distances };
};
