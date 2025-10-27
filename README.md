# Graph Shortest Path
An interactive Next.js app to build graphs and visualize shortest-path algorithms. It includes a graph Builder page and a Simulator that animates Dijkstra step-by-step. 
Suitable for learning, experimentation, and embedding in React apps.

Technologies:
- Nextjs
- TypeScript, JavaScript
- React
- Tailwind CSS
- shadcn UI components
- SVG graph rendering

Key features:
- Dijkstra shortest path algorithm with step‑by‑step visualization.
- Interactive graph editor (Builder) to add nodes and edges with validation.
- JSON import/export compatible with the app schema.

Installation:
1. `npm install`
2. `npm run dev`

Project structure (essential):
- `src/` \- React/TypeScript source code
- `public/` \- static assets
- `README.md` \- this file

Contributing:
- Fork, create a feature branch and open a pull request against `main`.
- Add tests and documentation for new features.

## Architecture overview

Pure algorithm functions emit trace events, a tracer records the log, a stepper produces visualization states, and UI renders with SVG.

### Adding a New Algorithm

To add a new pathfinding algorithm (e.g., A*):

1.  **Create the Algorithm File:** Create a new file in `lib/algorithms/core/yourAlgo.ts` with the PathfindingAlgorithm signature and call trace for progress events.
2.  **Implement the Algorithm:** Implement your algorithm as a pure function with the `PathfindingAlgorithm` signature from `lib/algorithms/types.ts`.
      
3.  **Register the Algorithm:** In `components/GraphSimulator.tsx`, (`ALGORITHMS` and `ALGORITHM_NAMES`).

- The UI will surface it in the dropdown automatically.

Example:
 ```typescript
       import { PathfindingAlgorithm } from '../types';

       export const astar: PathfindingAlgorithm = (graph, startId, endId, trace) => {
         // trace({ type: 'visit', nodeId: 'A', distance: 10 });
        //return { path: [], distances: {} };
       };
   ```
## Data format (schema v1) 

- metadata: { directed: boolean; weighted: boolean; name?: string; description?: string }​

- nodes: Array<{ id: string; x: number; y: number; label?: string }> with normalized coordinates in the [0,1] range

- edges: Array<{ from: string; to: string; weight: number; label?: string }>

Example:
```typescript
       {
  "metadata": { "directed": false, "weighted": true, "name": "Sample" },
  "nodes": [
    { "id": "A", "x": 0.1, "y": 0.2, "label": "Start" },
    { "id": "B", "x": 0.7, "y": 0.4 },
    { "id": "C", "x": 0.4, "y": 0.8, "label": "End" }
  ],
  "edges": [
    { "from": "A", "to": "B", "weight": 2 },
    { "from": "A", "to": "C", "weight": 5 },
    { "from": "C", "to": "B", "weight": 1 }
  ]
}
   ```
## Requirements — Simulator (MVP)

### Goal and scope
- Visual simulator for shortest‑path algorithms with Dijkstra implemented; users select start/end and watch stepwise animation.​

### Core features
- Load graph JSON, validate schema and weights, and render via SVG with nodes, edges, and weight labels.​


- Controls: Play/Pause, Step, Reset, Speed; states: frontier, current, visited/finalized, relaxed, final path.​

Queue/frontier panel and distance labels near nodes for clarity.​

### Constraints
- Non‑negative edge weights; treat graph as undirected when metadata.directed is false.​

### UI/UX guidelines
- Minimal pastel theme with shadcn components; toasts for feedback via Sonner.​


- Tooltips for key actions; keyboard shortcuts (Space, N, R) are optional.​

### Performance targets
- Smooth interaction for graphs up to ~200 nodes and ~400 edges with SVG.​

### Testing (minimum)
- Unit tests for Dijkstra distances/predecessors and schema validators on small graphs.​

### Acceptance criteria
- Sample graph renders; user picks start/end; Play animates Dijkstra, Step advances once, Reset returns to initial; final path is emphasized.​

## Requirements — Graph Builder
### Goal and scope
- Interactive page at /builder to create and edit graphs conforming to the schema, with a clean shadcn + Tailwind UI and minimal dependencies.​

### In scope (MVP)
- Forms to add nodes (id, x, y, label) and edges (from, to, weight, label), edit metadata (directed, weighted, name, description), drag nodes on canvas, and export/import JSON.​

- Subtle SVG grid with normalized ticks; coordinates are normalized to and persist on drag.​

### Validation and rules
- Unique, non‑empty node ids; edges reference existing nodes; finite non‑negative weights for Dijkstra; if unweighted, use weight = 1 on export.​

### Canvas and rendering
- SVG with circles for nodes (id inside, label outside), lines with optional arrows for directed graphs, midpoint weight labels, clipped at node boundary to preserve arrowheads.​

### UX and accessibility
- Inline validation messages; non‑blocking toasts for success/fail; focus states and aria labels.​

### Constants (no magic numbers)
- Define sizes, strokes, grid steps and colors in a constants module used by canvas and builder.​

### Import/export
- Export a validated *.json matching the schema; suggested filename: name‑v1.json; import validates and loads or reports errors without mutating state.​

### Cross‑page graph sync
- LocalStorage cache with version and timestamp; Simulator ↔ Builder auto‑loads and persists if valid; Clear Graph resets to sample.​

### Acceptance criteria
- Create 3+ nodes and 3+ edges; dragging updates geometry; directed toggle shows/hides arrows; grid scales with viewBox; invalid inputs are blocked with clear messages.​

### Notes and non‑goals
- Algorithms requiring negative weights (e.g., Bellman–Ford) are out of scope for MVP; consider later additions like BFS, A*, and Floyd–Warshall.​

- Advanced layout, panning/zoom, undo/redo, bulk editing, and large‑scale rendering are deferred enhancements.​

### Toasts and shadcn
- Use Sonner for non‑blocking toasts with shadcn; see component docs for setup and usage in Next.js.​
