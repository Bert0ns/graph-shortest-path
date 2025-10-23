// Dijkstra algorithm stepper for visualization
import type { Graph } from "../graph/types";

export type DistanceMap = Record<string, number>;
export type PredecessorMap = Record<string, string | null>;

export interface RelaxedEdge {
  from: string;
  to: string;
}

export interface DijkstraState {
  current?: string;
  distances: DistanceMap;
  predecessors: PredecessorMap;
  frontier: string[]; // node ids sorted by tentative distance
  visited: Set<string>;
  done: boolean;
  path?: string[]; // resolved path from start to end (inclusive) when done
  relaxedEdges?: RelaxedEdge[]; // edges improved in the last step (usually 0..1 here)
}

type Phase = "extract" | "relax" | "done";

export class DijkstraStepper {
  private graph: Graph;
  private start: string;
  private end?: string;

  private distances: DistanceMap;
  private predecessors: PredecessorMap;
  private visited: Set<string>;
  private queue: Array<{ id: string; priority: number }>; // simple array-based min-queue

  private phase: Phase = "extract";
  private current?: string;
  private neighbors: Array<{ to: string; weight: number }> = [];
  private neighborIndex = 0;
  private lastRelaxed: RelaxedEdge[] = [];
  private finishedPath?: string[];

  constructor(graph: Graph, start: string, end?: string) {
    this.graph = graph;
    this.start = start;
    this.end = end;

    this.distances = Object.fromEntries(graph.nodes.map((n) => [n.id, Number.POSITIVE_INFINITY]));
    this.predecessors = Object.fromEntries(graph.nodes.map((n) => [n.id, null]));
    this.visited = new Set<string>();
    this.queue = [];

    if (this.distances[start] !== undefined) this.distances[start] = 0;
    // seed queue with start
    this.pushOrUpdate(start, 0);
  }

  reset(start?: string, end?: string) {
    if (start) this.start = start;
    if (end !== undefined) this.end = end;
    this.distances = Object.fromEntries(this.graph.nodes.map((n) => [n.id, Number.POSITIVE_INFINITY]));
    this.predecessors = Object.fromEntries(this.graph.nodes.map((n) => [n.id, null]));
    this.visited = new Set<string>();
    this.queue = [];
    this.phase = "extract";
    this.current = undefined;
    this.neighbors = [];
    this.neighborIndex = 0;
    this.lastRelaxed = [];
    this.finishedPath = undefined;
    if (this.distances[this.start] !== undefined) this.distances[this.start] = 0;
    this.pushOrUpdate(this.start, 0);
  }

  private buildNeighbors(id: string): Array<{ to: string; weight: number }> {
    return this.graph.edges
      .filter((e) => e.from === id)
      .map((e) => ({ to: e.to, weight: e.weight }));
  }

  private pushOrUpdate(id: string, priority: number) {
    const existing = this.queue.find((q) => q.id === id);
    if (existing) {
      existing.priority = Math.min(existing.priority, priority);
    } else {
      this.queue.push({ id, priority });
    }
  }

  private popMin(): { id: string; priority: number } | undefined {
    if (this.queue.length === 0) return undefined;
    let minIdx = 0;
    for (let i = 1; i < this.queue.length; i++) {
      if (this.queue[i].priority < this.queue[minIdx].priority) minIdx = i;
    }
    return this.queue.splice(minIdx, 1)[0];
  }

  private computeFrontierIds(): string[] {
    const ids = this.queue
      .filter((q) => !this.visited.has(q.id))
      .sort((a, b) => a.priority - b.priority)
      .map((q) => q.id);
    // de-duplicate while keeping order
    const seen = new Set<string>();
    const out: string[] = [];
    for (const id of ids) {
      if (!seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    }
    return out;
  }

  private reconstructPath(): string[] | undefined {
    if (!this.end) return undefined;
    if (this.distances[this.end] === Number.POSITIVE_INFINITY) return undefined;
    const path: string[] = [];
    let curr: string | null = this.end;
    while (curr) {
      path.push(curr);
      curr = this.predecessors[curr];
    }
    path.reverse();
    // ensure it starts with the requested start
    if (path[0] !== this.start) return undefined;
    return path;
  }

  private snapshot(done = false): DijkstraState {
    return {
      current: this.current,
      distances: { ...this.distances },
      predecessors: { ...this.predecessors },
      frontier: this.computeFrontierIds(),
      visited: new Set(this.visited),
      done,
      path: this.finishedPath,
      relaxedEdges: [...this.lastRelaxed],
    };
  }

  next(): DijkstraState {
    if (this.phase === "done") return this.snapshot(true);

    this.lastRelaxed = [];

    if (this.phase === "extract") {
      // Extract min from queue skipping already visited
      let item: { id: string; priority: number } | undefined;
      while ((item = this.popMin())) {
        if (!this.visited.has(item.id)) break;
      }
      if (!item) {
        // queue empty => done
        this.finishedPath = this.reconstructPath();
        this.phase = "done";
        return this.snapshot(true);
      }

      const u = item.id;
      this.current = u;
      this.visited.add(u);

      // If end is reached, finish
      if (this.end && u === this.end) {
        this.finishedPath = this.reconstructPath();
        this.phase = "done";
        return this.snapshot(true);
      }

      this.neighbors = this.buildNeighbors(u);
      this.neighborIndex = 0;
      this.phase = "relax";
      return this.snapshot(false);
    }

    if (this.phase === "relax") {
      if (this.neighborIndex < this.neighbors.length) {
        const u = this.current!;
        const { to: v, weight: w } = this.neighbors[this.neighborIndex++];
        // Relaxation only if v not finalized
        if (!this.visited.has(v)) {
          const alt = this.distances[u] + w;
          if (alt < this.distances[v]) {
            this.distances[v] = alt;
            this.predecessors[v] = u;
            this.pushOrUpdate(v, alt);
            this.lastRelaxed = [{ from: u, to: v }];
          }
        }
        return this.snapshot(false);
      } else {
        // Done with neighbors, go back to extract next
        this.phase = "extract";
        return this.snapshot(false);
      }
    }

    // Fallback
    this.phase = "done";
    this.finishedPath = this.reconstructPath();
    return this.snapshot(true);
  }

  getState(): DijkstraState {
    if (this.phase === "done") return this.snapshot(true);
    return this.snapshot(false);
  }
}
