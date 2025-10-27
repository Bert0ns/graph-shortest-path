<div align="center"> 
      <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white&style=flat" /> 
      <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=flat" /> 
      <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white&style=flat" /> 
      <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss&logoColor=white&style=flat" />
</div>
<h1 align="center">Graph Shortest Path</h1>
Interactive Next.js app to build graphs and visualize shortest‑path algorithms with an educational simulator.
Includes a graph Builder page.
Suitable for learning, experimentation.

#### 🤝 Contributing:
- Fork, create a feature branch and open a pull request against `main`.
- Add tests and documentation for new features.
- link to the issue you're trying to solve
- Keep requirement checklists updated in PRs so reviewers can verify scope quickly

### Key features:hm with step‑by‑step visualization.
- Interactive graph editor (Builder) to add nodes and edges with validation.
- JSON import/export compatible with the app schema.
  
### Tech stack and Constraints
- Framework: Next.js (App Router), React, TypeScript, Tailwind CSS.
- UI library: shadcn components only. Install components with commands like:
  - `pnpm dlx shadcn@latest add button`
  - `pnpm dlx shadcn@latest add select`
  - `pnpm dlx shadcn@latest add slider`
- Rendering choice: SVG for MVP (vector graphics).
  - Rationale: intuitive DOM interactivity, easy styling with Tailwind, straightforward highlighting/animation, good for up to a few hundred elements.
  - Canvas considered for future when graphs are very large or need low-level performance rendering.
- Dependencies: keep to a strict minimum; avoid heavy graph libraries.
- TypeScript: strict mode preferred.

### 🚀 Quick start:
1. `npm install`
2. `npm run dev`

---

## Architecture overview

The pathfinding visualization is built on a decoupled architecture that separates the core algorithm logic from the UI rendering. This makes it easy to add new algorithms without changing the UI code.
Pure algorithm functions emit trace events, a tracer records the log, a stepper produces visualization states, and UI renders with SVG.

### Adding a New Algorithm

To add a new pathfinding algorithm:

1.  **Create the Algorithm File:** Create a new file in `lib/algorithms/core/yourAlgo.ts`.
2.  **Implement the Algorithm:** Implement your algorithm as a pure function with the `PathfindingAlgorithm` signature from `lib/algorithms/types.ts`. Call `trace` function for progress events.
3.  **Register the Algorithm:** In `components/GraphSimulator.tsx`, (`ALGORITHMS` and `ALGORITHM_NAMES`).

- The UI will surface it in the dropdown automatically.

Example:
In `lib/algorithms/core/a-star.ts`:
 ```typescript
       import { PathfindingAlgorithm } from '../types';

       export const astar: PathfindingAlgorithm = (graph, startId, endId, trace) => {
         // trace({ type: 'visit', nodeId: 'A', distance: 10 });
             return { path: [], distances: {} };
       };
 ```
In `components/GraphSimulator.tsx`:
```typescript
// 1. Import the algorithm
import { astar } from '@/lib/algorithms/core/astar';

// 2. Add it to the maps
const ALGORITHMS: Record<string, PathfindingAlgorithm> = {
      dijkstra,
      astar, // Add your new algorithm here
};

const ALGORITHM_NAMES: Record<AlgorithmKey, string> = {
      dijkstra: 'Dijkstra',
      astar: 'A* Search', // And add its display name here
};
```

---

## 📦 Graph data format

- metadata: { directed: boolean; weighted: boolean; name?: string; description?: string }

- nodes: Array<{ id: string; x: number; y: number; label?: string }> with normalized coordinates in the range [0,1].

- edges: Array<{ from: string; to: string; weight: number; label?: string }>.

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

---

## Requirements - Simulator (MVP)

### 🧭 Simulator checklist

- [x] Tech stack set: Next.js (App Router), React, TypeScript, Tailwind, shadcn
- [x] Rendering backend: SVG chosen and implemented
- [x] Graph schema v1 implemented (graph-level directed/weighted; no per-edge directed override)
- [x] Load sample graph from public/graphs/sample.json
- [x] Import graph (JSON) on the simulator page with validation and toasts (Sonner)
- [x] Dijkstra algorithm implemented with stepper state machine
- [x] Animation controls: Play/Pause, Step, Reset, Speed
- [x] Visual states: current, frontier, visited/finalized, relaxed edges, final path
- [x] Distances shown near nodes
- [x] Start/End selection by clicking nodes (with rings)
- [x] Queue/frontier panel shown
- [x] Minimal pastel UI via shadcn components
- [x] Cross-page graph cache (Builder ↔ Simulator) via localStorage with validation
- [x] Clear graph action in Builder; fallback to sample on simulator
- [x] Contextual tooltips for key actions (Visualizer: click nodes to set start/end; Builder: drag nodes to reposition)
- [ ] Keyboard shortcuts (Space, N, R)
- [ ] Unit tests for Dijkstra and validators
- [ ] Accessibility pass (focus states, aria labels, contrast review)
- [ ] Performance validation at stated scale (200/400 elements)
- [ ] Optional overlays beyond frontier list (e.g., distances table)

### Goal and scope
- Visual simulator for shortest‑path algorithms; users select start/end and watch stepwise animation.

### Core features
- Load graph JSON, validate schema and weights, and render via SVG with nodes, edges, and weight labels.

- Controls: Play/Pause, Step, Reset, Speed; node states: frontier, current, visited/finalized, relaxed, final path.

Queue/frontier panel and distance labels near nodes for clarity.

### UI/UX guidelines
- Minimal pastel theme with shadcn components; toasts for feedback via Sonner.

- Tooltips for key actions; keyboard shortcuts (Space, N, R) are optional.

### Performance targets
- Smooth interaction for graphs up to ~200 nodes and ~400 edges with SVG.

### Testing (minimum)
- Unit tests for all algorithms
- Schema validation when importing

---

## Requirements - Graph Builder 🧱

### 🧱 Builder checklist
- [x] Page scaffold at `/builder` with header and navigation back to Home
- [x] Metadata form (directed, weighted, name, description)
- [x] Add Node form (id, x, y, optional label)
- [x] Add Edge form (from, to, weight, optional label)
- [x] Lists section for nodes and edges with delete actions
- [x] Import JSON (file picker) with validation and toasts (Sonner)
- [x] Export JSON (validates and downloads)
- [x] Local cache sync with Simulator via localStorage (auto-load/save, clear action)
- [x] Background grid in canvas with coordinate ticks (builder-only, subtle and elegant)
- [x] Drag-and-drop nodes on canvas with normalized coordinate updates
- [ ] Live inline validation on forms for all constraints (some checks present, complete coverage pending)
- [ ] Edit existing node/edge via selection (beyond delete)
- [x] Prevent magic numbers by moving remaining sizes to `lib/graph/graph_constants.ts`
- [ ] Accessibility/keyboard affordances for builder interactions
- [ ] Optional: panning/zoom (deferred), grid/snap (deferred)

### Goal and scope
- Interactive page at /builder to create and edit graphs conforming to the schema, with a clean shadcn + Tailwind UI and minimal dependencies.

### In scope (MVP)
- Forms to add nodes (id, x, y, label) and edges (from, to, weight, label), edit metadata (directed, weighted, name, description), drag nodes on canvas, and export/import JSON.

- Subtle SVG grid with normalized ticks; coordinates are normalized to and persist on drag.

### Validation and rules
- Unique, non‑empty node ids; edges reference existing nodes; finite non‑negative weights for Dijkstra; if unweighted, use weight = 1 on export.

### UX and accessibility
- Inline validation messages; non‑blocking toasts for success/fail; focus states and aria labels.

### Constants (no magic numbers)
- Define sizes, strokes, grid steps and colors in a constants module used by canvas and builder.

### Import/export
- Export a validated *.json matching the schema; suggested filename: name‑v1.json; import validates and loads or reports errors without mutating state.

### Cross‑page graph sync
- LocalStorage cache with version and timestamp; Simulator ↔ Builder auto‑loads and persists if valid; Clear Graph resets to sample.

### Notes and non‑goals
- Advanced layout, panning/zoom, undo/redo, bulk editing, and large‑scale rendering are deferred enhancements.

### Toasts and shadcn
- Use Sonner for non‑blocking toasts with shadcn; see component docs for setup and usage in Next.js.
