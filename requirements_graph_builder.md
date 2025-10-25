# Graph Builder Page Requirements

Status checklist (Builder implementation)
- [x] Page scaffold at `/builder` with header and navigation back to Home
- [x] Metadata form (directed, weighted, name, description)
- [x] Add Node form (id, x, y, optional label)
- [x] Add Edge form (from, to, weight, optional label)
- [x] Lists section for nodes and edges with delete actions
- [x] Import JSON (file picker) with validation and toasts (Sonner)
- [x] Export JSON (validates and downloads)
- [x] Local cache sync with Simulator via localStorage (auto-load/save, clear action)
- [ ] Drag-and-drop nodes on canvas with normalized coordinate updates
- [ ] Live inline validation on forms for all constraints (some checks present, complete coverage pending)
- [ ] Edit existing node/edge via selection (beyond delete)
- [x] Prevent magic numbers by moving remaining sizes to `lib/graph/graph_constants.ts`
- [ ] Accessibility/keyboard affordances for builder interactions
- [ ] Optional: panning/zoom (deferred), grid/snap (deferred)

---

Status: Draft v1 (keeps general app requirements in `requirements_mvp.md` valid)

Goal: Provide an interactive page to construct graph JSON files that are compatible with the app’s existing schema and visualizer, with a clean minimal UI (shadcn + Tailwind), minimal dependencies, and no magic numbers.

## Scope
- In-scope (MVP):
  - Create nodes via a form (id, initial_positionx, initial_positiony, optional label) and spawn them on the canvas.
  - Drag-and-drop nodes to adjust their positions; edges update dynamically.
  - Create edges (arcs) via a form (from, to, weight); edge is not draggable.
  - Edit graph metadata (directed, weighted, name, description).
  - Live validation and helpful error messages.
  - Export the built graph as a JSON file conforming to the app schema.
  - Import an existing JSON to continue editing (optional if time permits, but recommended).
- Out-of-scope (MVP):
  - Advanced layout algorithms and auto-routing.
  - Multi-select, bulk edit, and grouping.
  - Algorithm execution/animation (handled elsewhere in the app).
  - Undo/redo history.
  - Zoom

## Technology & UI
- Tech stack: Next.js, React, TypeScript, Tailwind CSS, shadcn UI components.
- Keep dependencies minimal; do not introduce additional UI libs.
- Use SVG for rendering the graph (consistent with the visualizer), with CSS variables/Tailwind tokens for colors and sizes.
- Palette: simple, pastel, minimalistic; align with existing app styling.
- Use shadcn components for inputs: Button, Input, Label, Select, Checkbox, Dialog/Sheet (for forms if appropriate), Toast for notifications.

## Data Model Compatibility
- Must produce/consume the existing schema defined in `lib/graph/types.ts`:
  - GraphFile:
    - metadata: { directed: boolean; weighted: boolean; name?: string; description?: string }
    - nodes: GraphNode[] where GraphNode { id: string; x: number; y: number; label?: string }
    - edges: GraphEdge[] where GraphEdge { from: string; to: string; weight: number; label?: string }
- Coordinates are normalized (x, y ∈ [0, 1]). The builder must store and export normalized coordinates regardless of view size/zoom.
- Constraints:
  - Node ids are unique, non-empty strings.
  - Edge endpoints must reference existing node ids.
  - For Dijkstra compatibility, weight must be a finite number; recommend non-negative.
  - If `metadata.weighted` is false, the builder may enforce/suggest weight = 1 for all edges on export.

## Page Layout (suggested sections)
- Canvas/Stage area (left/main): SVG rendering.
- Side panel (right) with tabs or sections:
  1) Graph Metadata: directed (checkbox), weighted (checkbox), name, description.
  2) Add Node form.
  3) Add Edge form.
  4) List(s): nodes and edges with minimal controls (select to edit/delete).
- Top bar (or footer): actions (New, Import, Export JSON, Reset View, Help).

## Node Creation Flow
- Form fields (shadcn inputs):
  - id (string, required, unique)
  - initial_positionx (number, required, 0 ≤ x ≤ 1)
  - initial_positiony (number, required, 0 ≤ y ≤ 1)
  - label (string, optional)
- On submit:
  - Validate; if valid, create node in the internal state and spawn a circle at normalized (x, y) mapped to current view.
  - Clear form or keep values per UX setting.
- Node interactions:
  - Draggable within the canvas; while dragging, display current normalized coordinates.
  - On drop, persist new normalized x,y in state.
  - Keyboard: Esc cancels drag; optional snapping.

## Edge (Arc) Creation Flow
- Form fields:
  - from (select of existing node ids, required)
  - to (select of existing node ids, required)
  - weight (number, required, finite; recommend non-negative)
- On submit:
  - Validate; if valid, create edge.
  - Render as a line between the two node centers with an arrowhead if `metadata.directed` is true.
- Behavior:
  - Edge is not draggable.
  - When either endpoint node moves, the edge re-renders so it always connects node perimeters, not overlapping the circle and not hiding arrowheads.
  - If `from === to`, disallow (MVP).

## Canvas/Rendering Rules (SVG)
Use as reference the already created component GraphCanvas.tsx. Extract common rendering logic and code, make it clean.
- Node visual:
  - Circle with id rendered inside the circle.
  - Optional label rendered outside (e.g., below or adjacent) to avoid overlap.
  - Size and stroke widths must be defined by constants/config (no magic numbers).
- Edge visual:
  - Straight line or slight curve (if needed later). For MVP, straight line.
  - Arrowheads for directed graphs; arrowheads must remain visible (clip/offset lines to end at the circle boundary, not center).
  - Weight label positioned at the midpoint of the edge, offset to avoid overlap.
- Styling:
  - Pastel palette; selected/hover states distinct and accessible.
  - Tailwind utility classes and CSS variables; no hard-coded literal numbers without named constants.

## Panning, Zooming, and Coordinates
- MVP: no panning
- MVP: no zoom
- At any view state, node drag must update normalized coordinates correctly relative to the underlying canvas size.

## Editing and Deleting
- Node edit:
  - Select a node to open an edit form (id is immutable or safely updatable with referential integrity checks; MVP may keep id immutable).
  - Update label and optionally positions via form, or by dragging.
- Node delete:
  - Deleting a node removes connected edges after confirmation.
- Edge edit/delete:
  - Select an edge in list to edit its weight or delete.

## Validation & Error Handling
- Inline validation for all forms with specific messages (e.g., "id is required", "x must be between 0 and 1").
- Prevent creation of duplicates or references to non-existent nodes.
- If `metadata.weighted` is false, surface a warning when setting custom weights.
- Provide a non-blocking toast for success/fail actions (e.g., Export succeeded, Import failed: reason).
- Reuse existing validation logic when possible (e.g., mirror `validateGraphFile` checks before export).

## State Management
- Client-side state only (MVP), persistent across route changes not required.
- Consider URL-safe serialization or localStorage autosave (optional, nice-to-have).
- Single source of truth for graph (metadata, nodes, edges) to feed both renderer and export.

## Import/Export
- Export: Download a `*.json` file that matches `GraphFile` schema exactly.
  - File name suggestion: `${metadata.name || 'graph'}-v1.json`.
  - Run validation before export; block with clear error list if invalid.
- Import (recommended): Load a JSON file, validate, and populate the builder.
  - On validation failure, show error list and do not mutate current state.

## Accessibility & UX
- Keyboard focus states for all inputs and buttons.
- Sufficient contrast for text on pastel background.
- Tooltips or helper text for form fields.
- Cursor changes for draggable nodes.

## Constants (No Magic Numbers)
- All sizes and timings must be defined via constants or CSS variables:
  - NODE_RADIUS, NODE_STROKE_WIDTH, EDGE_STROKE_WIDTH, ARROW_SIZE, LABEL_OFFSET, HITBOX_PADDING, GRID_SIZE (if snapping), ZOOM_MIN/MAX, PAN_SPEED.
- Keep them in a single config module (e.g., `lib/graph/graph_constants.ts`) and reference consistently.

## Testing & Acceptance Criteria (MVP)
- Can create 3+ nodes and 3+ edges; dragging nodes updates edge geometry correctly.
- Exported JSON passes `validateGraphFile` and can be opened by the existing viewer.
- Directed toggle shows/hides arrowheads without clipping.
- Node id text is inside the circle; labels are outside and readable.
- Form validation prevents bad inputs (e.g., x = 1.5; duplicate id; unknown node in edge).

## Future Enhancements (Non-MVP)
- Self-loops and multi-edges rendering.
- Curved edges with collision avoidance.
- Snapping to grid and smart guides.
- Undo/redo history.
- LocalStorage autosave sessions and versioning.
- Bulk import/edit via table.
- Theming controls for palette.
