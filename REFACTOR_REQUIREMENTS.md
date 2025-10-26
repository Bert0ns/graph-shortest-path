# Refactoring for a Modular Algorithm Architecture

## 1. Overview

The goal of this refactoring is to decouple the core pathfinding algorithm logic from the UI's visualization and stepping logic. This will create a modular "plug-in" architecture, making it simple to add, test, and optimize new algorithms without modifying the user interface.

## 2. Current Architecture & Problem

- The `DijkstraStepper` class currently mixes the Dijkstra algorithm's logic with state management specifically for visualization (e.g., `phase`, `lastRelaxed`, `frontier`).
- To add a new algorithm like A*, a new `AStarStepper` class would need to be created, duplicating the complex and UI-specific stepper mechanism.
- This makes it hard to focus purely on the algorithm's performance and correctness.

## 3. Proposed Architecture Requirements

We will separate the system into three distinct parts: the **Core Algorithm**, the **Algorithm Tracer**, and the **UI Stepper**.

### 3.1. Core Algorithm Interface

- **Requirement:** All algorithms must be implemented as pure, stateless functions that conform to a standard interface.
- **Action:** Define a generic `PathfindingAlgorithm` interface.
- **Details:**
  - This function will take the `Graph`, `startNode`, and `endNode` as input.
  - During its execution, it will call a provided `trace` function to record key events (e.g., visiting a node, relaxing an edge).
  - It will return a final `PathfindingResult`.

```typescript
// In a new file: lib/algorithms/types.ts

export type TraceEvent =
  | { type: 'visit', nodeId: NodeId, distance: number }
  | { type: 'relax', from: NodeId, to: NodeId, newDistance: number }
  | { type: 'finish', path: NodeId[], totalDistance: number };

export type TraceFunction = (event: TraceEvent) => void;

export interface PathfindingResult {
  path: NodeId[];
  distances: Map<NodeId, number>;
}

export type PathfindingAlgorithm = (
  graph: Graph,
  startId: NodeId,
  endId: NodeId,
  trace: TraceFunction
) => PathfindingResult;
```

### 3.2. The Algorithm Tracer

- **Requirement:** Create a generic "tracer" that executes an algorithm and records its step-by-step history.
- **Action:** Implement a function `traceAlgorithm`.
- **Details:**
  - This function will accept any algorithm that conforms to the `PathfindingAlgorithm` interface.
  - It will provide the `trace` function to the algorithm.
  - It will collect all `TraceEvent`s into an array (a "trace log").
  - This trace log is the complete, serializable history of the algorithm's execution, which the UI can then play back.

```typescript
// In a new file: lib/algorithms/visualization/tracer.ts

export function traceAlgorithm(
  algorithm: PathfindingAlgorithm,
  graph: Graph,
  startId: NodeId,
  endId: NodeId
): TraceEvent[] {
  const traceLog: TraceEvent[] = [];
  const trace: TraceFunction = (event) => {
    traceLog.push(event);
  };
  algorithm(graph, startId, endId, trace);
  return traceLog;
}
```

### 3.3. The UI Stepper

- **Requirement:** The UI should be driven by a generic stepper that consumes the "trace log".
- **Action:** Create a new `TraceStepper` class.
- **Details:**
  - The stepper will be initialized with a `traceLog` (the array of `TraceEvent`s).
  - Its `.next()` method will read the next event from the log and update a `VisualizationState` object.
  - The `GraphSimulator` component will use this new stepper instead of `DijkstraStepper`. The `DijkstraState` will be replaced by a new, generic `VisualizationState`.

```typescript
// In a new file: lib/algorithms/visualization/TraceStepper.ts

// This state is built progressively by the stepper for the UI
export interface VisualizationState {
  current?: NodeId;
  distances: Map<NodeId, number>;
  predecessors: Map<NodeId, NodeId | null>;
  visited: Set<NodeId>;
  frontier: NodeId[]; // This can be derived from visited nodes and their neighbors
  path?: NodeId[];
  relaxedEdges?: { from: NodeId, to: NodeId }[];
  done: boolean;
}

// The new stepper will manage playing back the trace
export class TraceStepper {
  private trace: TraceEvent[];
  private step = 0;
  public state: VisualizationState;

  constructor(trace: TraceEvent[]) {
    // ...
  }

  next(): VisualizationState {
    // ... reads the next event and updates `this.state`
  }
}
```

## 4. Implementation Steps

1.  **Create `lib/algorithms/types.ts`** with the new interface definitions.
2.  **Refactor `dijkstra.ts`** into a pure function `dijkstra: PathfindingAlgorithm` located in `lib/algorithms/core/dijkstra.ts`. It will no longer be a class.
3.  **Create the `traceAlgorithm` function** in `lib/algorithms/visualization/tracer.ts`.
4.  **Create the new `TraceStepper` class** in `lib/algorithms/visualization/TraceStepper.ts`.
5.  **Update `GraphSimulator.tsx`:**
    -   Remove references to `DijkstraStepper`.
    -   On initialization, call `traceAlgorithm` to get the full trace.
    -   Instantiate `TraceStepper` with the generated trace.
    -   Update the component's state management to use the new `VisualizationState`.
6.  **Delete the old `DijkstraStepper`** logic.

## 5. Acceptance Criteria

- The Dijkstra algorithm visualization works exactly as it did before the refactor.
- The core Dijkstra logic is now a pure, easily testable function in its own file.
- To add a new algorithm (e.g., A*), a developer only needs to:
  1.  Create a new file `lib/algorithms/core/a_star.ts`.
  2.  Implement the `PathfindingAlgorithm` interface.
  3.  Add "a_star" to the algorithm dropdown in the UI.
- No changes should be needed in `GraphSimulator` or any other UI component to add a new algorithm.
