import type {Graph, NodeId} from "../graph/types";

export type DistanceMap = Record<NodeId, number>;
export type PredecessorMap = Record<NodeId, NodeId | null>;

export interface RelaxedEdge {
    from: NodeId;
    to: NodeId;
}

export interface DijkstraState {
    current?: NodeId;
    distances: DistanceMap;
    predecessors: PredecessorMap;
    frontier: NodeId[]; // node ids sorted by tentative distance
    visited: Set<NodeId>;
    done: boolean;
    path?: NodeId[]; // resolved path from start to end (inclusive) when done
    relaxedEdges?: RelaxedEdge[]; // edges improved in the last step (usually 0..1 here)
}

type Phase = "extract" | "relax" | "done";

export class DijkstraStepper {
    private graph: Graph;
    private start: NodeId;
    private end?: NodeId;

    private distances: DistanceMap;
    private predecessors: PredecessorMap;
    private visited: Set<NodeId>;
    private queue: Map<NodeId, number>;

    private phase: Phase = "extract";
    private current?: NodeId;
    private neighbors: Array<{ to: NodeId; weight: number }> = [];
    private neighborIndex = 0;
    private lastRelaxed: RelaxedEdge[] = [];
    private finishedPath?: NodeId[];

    constructor(graph: Graph, start: NodeId, end?: NodeId) {
        this.graph = graph;
        this.start = start;
        this.end = end;

        this.distances = Object.fromEntries(graph.nodes.map((n) => [n.id, Number.POSITIVE_INFINITY]));
        this.predecessors = Object.fromEntries(graph.nodes.map((n) => [n.id, null]));
        this.visited = new Set<NodeId>();
        this.queue = new Map<NodeId, number>();

        if (this.distances[start] !== undefined) this.distances[start] = 0;
        // seed queue with start
        this.pushOrUpdate(start, 0);
    }

    reset(start?: NodeId, end?: NodeId) {
        if (start) this.start = start;
        if (end !== undefined) this.end = end;
        this.distances = Object.fromEntries(this.graph.nodes.map((n) => [n.id, Number.POSITIVE_INFINITY]));
        this.predecessors = Object.fromEntries(this.graph.nodes.map((n) => [n.id, null]));
        this.visited = new Set<NodeId>();
        this.queue = new Map<NodeId, number>();
        this.phase = "extract";
        this.current = undefined;
        this.neighbors = [];
        this.neighborIndex = 0;
        this.lastRelaxed = [];
        this.finishedPath = undefined;
        if (this.distances[this.start] !== undefined) this.distances[this.start] = 0;
        this.pushOrUpdate(this.start, 0);
    }

    getState(): DijkstraState {
        if (this.phase === "done") return this.snapshot(true);
        return this.snapshot(false);
    }

    next(): DijkstraState {
        if (this.phase === "done") return this.snapshot(true);
        this.lastRelaxed = [];

        if (this.phase === "extract") {
            return this.extractPhase()
        } else if (this.phase === "relax") {
            return this.relaxPhase()
        }

        // Fallback
        this.setDone();
        return this.snapshot(true);
    }

    private extractPhase(): DijkstraState {
        // Extract min from priority queue
        const item = this.popMin();
        if (!item) {
            // empty queue -> done
            this.setDone();
            return this.snapshot(true);
        }

        const u = item.id;
        this.current = u;
        this.visited.add(u);

        // Se raggiunto il nodo di destinazione, termina
        if (this.end && u === this.end) {
            this.setDone();
            return this.snapshot(true);
        }

        this.neighbors = this.buildNeighbors(u);
        this.neighborIndex = 0;
        this.phase = "relax";
        return this.snapshot(false);
    }

    private relaxPhase(): DijkstraState {
        if (this.neighborIndex < this.neighbors.length) {
            const u = this.current!;
            const {to: v, weight: w} = this.neighbors[this.neighborIndex++];
            // Relaxation solo se v non è già finalizzato
            if (!this.visited.has(v)) {
                const alt = this.distances[u] + w;
                if (alt < this.distances[v]) {
                    this.distances[v] = alt;
                    this.predecessors[v] = u;
                    this.pushOrUpdate(v, alt);
                    this.lastRelaxed = [{from: u, to: v}];
                }
            }
        } else {
            this.phase = "extract";
        }
        return this.snapshot(false);
    }

    private buildNeighbors(id: NodeId): Array<{ to: NodeId; weight: number }> {
        return this.graph.edges
            .filter((e) => e.from === id)
            .map((e) => ({to: e.to, weight: e.weight}));
    }

    private pushOrUpdate(id: NodeId, priority: number) {
        const prev = this.queue.get(id);
        if (prev === undefined) {
            this.queue.set(id, priority);
        } else if (priority < prev) {
            this.queue.set(id, priority);
        }
    }

    private popMin(): { id: NodeId; priority: number } | undefined {
        let minId: NodeId | undefined;
        let minPri = Number.POSITIVE_INFINITY;

        for (const [id, pri] of this.queue) {
            if (this.visited.has(id)) continue;
            if (pri < minPri) {
                minPri = pri;
                minId = id;
            }
        }

        if (minId === undefined) return undefined;
        this.queue.delete(minId);
        return {id: minId, priority: minPri};
    }

    private computeFrontierIds(): NodeId[] {
        return [...this.queue.entries()]
            .filter(([id]) => !this.visited.has(id))
            .sort((a, b) => a[1] - b[1])
            .map(([id]) => id);
    }

    private reconstructPath(): NodeId[] | undefined {
        if (!this.end) return undefined;
        if (this.distances[this.end] === Number.POSITIVE_INFINITY) return undefined;
        const path: NodeId[] = [];
        let curr: NodeId | null = this.end;
        while (curr) {
            path.push(curr);
            curr = this.predecessors[curr];
        }
        path.reverse();
        if (path[0] !== this.start) return undefined;
        return path;
    }

    private setDone(): void {
        this.finishedPath = this.reconstructPath();
        this.phase = "done";
    }

    private snapshot(done = false): DijkstraState {
        return {
            current: this.current,
            distances: {...this.distances},
            predecessors: {...this.predecessors},
            frontier: this.computeFrontierIds(),
            visited: new Set(this.visited),
            done,
            path: this.finishedPath,
            relaxedEdges: [...this.lastRelaxed],
        };
    }
}
