# Shortest Path Simulator — Requirements

Status checklist (MVP implementation)
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

Notes on scope deviations
- The per-edge "directed" flag mentioned in earlier drafts is not implemented. Current schema treats directed as a graph-level setting. Edges do not carry a directed boolean. This remains a deferred enhancement.

---

## 1) Goal and Vision
Build a visual simulator for shortest-path algorithms. Start with Dijkstra and a clean, minimal UI that animates each algorithm step.

The system must be easy to extend with new algorithms and features while keeping dependencies minimal.

## 2) Scope (MVP)
- One algorithm implemented: Dijkstra (non-negative edge weights only).
- A static graph is loaded from a simple text-structured file (JSON) and rendered visually.
- Users can choose start and end nodes and run an animation that shows Dijkstra’s steps.
- Basic controls: play/pause, step, reset, and speed control.
- Visual states: unvisited, in frontier, current node, relaxed edges, finalized nodes, final shortest path.
- UI components use shadcn library only.

## 3) Non-Goals (for now)
- No negative weights or algorithms requiring them (e.g., Bellman–Ford) in MVP.
- No large-scale performance optimization beyond the stated limits.
- No multi-graph workspace management; load a single graph at a time.
- No persistent storage or server-side editing of graphs.

## 4) Tech Stack and Constraints
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

## 5) Graph Data Format (File-Based Builder)
- File format: JSON stored under public/graphs (e.g., public/graphs/sample.json).
- Loaded client-side via fetch at runtime.
- Schema (Version 1):
  - metadata: { directed: boolean, weighted: boolean, name?: string, description?: string }
  - nodes: Array<{ id: string; x: number; y: number; label?: string }>
  - edges: Array<{ from: string; to: string; weight: number; label?: string }>
- Rules:
  - Node ids are unique (string).
  - Coordinates (x, y) are normalized to the viewport (0..1) or pixels; MVP uses 0..1 normalized, scaled by viewBox.
  - If metadata.directed is false, treat edges as undirected (no arrows) in rendering.
  - Dijkstra requires all weights >= 0; validate and show a non-blocking error if violated.

Example JSON (normalized coordinates):
```json
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

## 6) Core Features
- Graph loading
  - Load a selected JSON file from public/graphs.
  - Validate basic schema and weight constraints; display user-friendly errors.
- Graph rendering (SVG)
  - Nodes as circles with labels.
  - Edges as lines/arrows with optional weight labels.
  - Auto-fit to container with viewBox; maintain aspect ratio.
- Algorithm selection
  - A select input listing available algorithms; MVP shows Dijkstra (others disabled or listed as “coming soon”).
- Start/End selection
  - Click on nodes to set start and end; show selected states; provide a quick reset.
- Animation controls
  - Play/Pause, Step (advance a single algorithm iteration), Reset (clear to initial), Speed control (e.g., 0.25x–2x).
- Dijkstra visualization
  - Show current node being extracted from the priority queue.
  - Highlight frontier nodes and relaxed edges.
  - Display tentative distances next to nodes.
  - When target is finalized, draw the final shortest path with strong emphasis.
- Optional overlays (MVP-light)
  - Sidebar or popover showing queue contents and distances.

## 7) UI/UX Guidelines
- Style: clean, minimalistic, pastel color palette.
  - Suggested palette (tailwind custom or CSS variables):
    - Background: #FAFAF9
    - Node default: #A7F3D0 (mint) / stroke #34D399
    - Frontier: #BFDBFE (azure) / stroke #60A5FA
    - Current: #FDE68A (sand) / stroke #F59E0B
    - Finalized: #FCA5A5 (salmon) / stroke #F87171
    - Path highlight: #C4B5FD (lavender) / stroke #8B5CF6
    - Edge default: #CBD5E1
    - Text: #0F172A
- Layout
  - Header toolbar: algorithm select, start/end indicators, controls, speed slider.
  - Main canvas: responsive SVG area.
  - Optional right/left drawer for queue/distances panel.
- Interactions
  - Hover tooltips for key actions and controls:
    - Visualizer: on nodes, “Click to set start/end”. On controls, “Play/Pause animation”, “Step forward once”, “Reset to initial state”, “Change speed”.
    - Builder: on nodes, “Drag to reposition node” (edges update automatically). On toolbar/buttons, “Import/Export/Clear graph”.
  - Keyboard shortcuts (MVP): Space (play/pause), N (step), R (reset).
- Accessibility
  - Focusable controls; aria labels; sufficient contrast.

## 8) Algorithm Requirements (Dijkstra)
- Inputs
  - Graph (nodes, edges), start id, optional end id.
- Constraints
  - Non-negative weights; undirected edges represented as two directions logically if needed.
- Outputs
  - Distances map, predecessor map, visited/finalized set, final path to end if end specified.
- Stepper API (for animation)
  - Initialize: returns initial state.
  - Next step: yields a diff/state snapshot including: current node, relaxations, frontier, distances.
  - Done state: indicates completion and includes final path reconstruction.

## 9) Architecture and Structure (MVP)
- app/
  - page.tsx: main UI scaffold.
- components/: reusable UI pieces (GraphCanvas, Controls, Legend, QueuePanel).
- lib/
  - graph/types.ts: TypeScript types for schema.
  - graph/loader.ts: validation and loading helpers.
  - algorithms/dijkstra.ts: pure algorithm + stepper interface.
  - utils.ts: small helpers (color mapping, formatting).
- public/graphs/
  - sample.json and future examples.

## 10) Performance Targets
- Designed for graphs up to ~200 nodes and ~400 edges in MVP without noticeable lag at 60 FPS on a typical laptop.
- Animation step duration adjustable; avoid re-render storms (memoize where needed).

## 11) Error Handling
- Invalid schema or weights: show inline non-blocking error with guidance.
- Missing start/end: disable run until both are set.
- Disconnected graph: show message when target unreachable and show visited set.

## 12) Testing (Minimum)
- Unit tests for Dijkstra core (distances, predecessors) on small graphs.
- Type-level tests via TypeScript for schema validation helpers.
- Visual/manual checklist for animation states.

## 13) Extensibility (Post-MVP)
- New algorithms: BFS (unweighted), A*, Bellman–Ford, Floyd–Warshall.
- Heuristics and grid graphs (for A*), obstacles and random graph generators.
- Canvas/WebGL renderer option for large graphs with togglable backends.
- Import/export formats: CSV, DOT/Graphviz, GraphML.
- Interactive graph editor (drag nodes, add/remove edges) with persistence.

## 14) Acceptance Criteria
- User can load the default sample graph and see it rendered with nodes, edges, and weight labels.
- User can select start and end nodes by clicking.
- With Dijkstra selected, clicking Play animates the algorithm step-by-step; Step advances exactly one iteration.
- Distances and frontier/current/finalized states are visually distinct per the palette.
- When the end node is finalized, the shortest path is highlighted and the total distance is visible.
- UI uses only shadcn components; no additional UI frameworks.

## 15) Out of Scope (MVP)
- Real-time multi-user collaboration.
- Mobile-first optimizations beyond responsive layout basics.
- Persisted user settings.
- No server interactions; all client-side.

## 16) Cross-Page Graph Sync (Builder ↔ Simulator)
Goal: Seamlessly carry the same graph data between the Builder page and the Simulator (home) page without manual re-imports.

- General
  - Maintain a single, shared “current graph” cache available to both pages; no server required.
  - The cache must be client-side only (e.g., `localStorage`) with a stable, namespaced key and a schema version (e.g., `graph.current.v1`).
  - Store: { schemaVersion: 1, updatedAt: ISO string, graph: Graph }.
  - Validation: every load must pass through the existing graph validator; invalid or incompatible data is ignored and cleared.

- Simulator → Builder
  - From the simulator (home) page, when the user navigates to the Builder, the current in-memory graph is written to the cache immediately (debounced) so the Builder opens with the same graph auto-loaded.
  - If no current graph is present, the Builder starts from an empty template or the sample graph (configurable), but must not crash.

- Builder → Simulator
  - On save/confirm in the Builder (or after validated edits), write the edited graph into the cache.
  - Navigating back to the simulator auto-loads the cached graph and renders it without requiring manual import.

- UX and Feedback
  - Use Sonner to provide lightweight feedback: “Loaded graph from cache”, “Saved edited graph”, or validation errors.
  - Provide a Clear Graph action in both pages to remove the cached graph and fall back to the sample.

- Behavior and Edge Cases
  - Fallback: if the cache is empty or invalid, fall back to `public/graphs/sample.json`.
  - Versioning: if `schemaVersion` doesn’t match the runtime schema, ignore and clear the cache with an info toast.
  - Quota/Exceptions: handle storage exceptions gracefully and inform the user.
  - Cross-tab: listen to the `storage` event to reflect updates if both pages are open in different tabs (optional nice-to-have).

- API Contract (internal helper)
  - `getCachedGraph(): Graph | null` — reads, validates, returns graph or null.
  - `setCachedGraph(graph: Graph): void` — writes with version/timestamp; debounced where appropriate.
  - `clearCachedGraph(): void` — removes the cache entry.
  - Constants for the cache key and schema version live in a single module; no magic strings.

- Acceptance (sync-specific)
  - Opening Builder from Simulator loads the same graph without manual export/import.
  - Returning to Simulator from Builder renders the edited graph automatically.
  - Clearing the cache reverts both pages to the sample graph.
  - All operations show appropriate toasts and never break the main animation flow.
