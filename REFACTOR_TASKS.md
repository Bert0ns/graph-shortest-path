# Refactoring Task Breakdown

This document breaks down the refactoring effort outlined in `REFACTOR_REQUIREMENTS.md` into smaller, sequential, and actionable tasks. Each task should be completed and verified before moving to the next.

Follorw the development guidelines in `.gemini/developer.md` while working on these tasks.

---

### Task 1: Define Core Types and Interfaces

**Scope:** Create a single source of truth for the types and interfaces that will decouple the algorithms from the visualization logic.

**Files to Create:**
- `lib/algorithms/types.ts`

**Acceptance Criteria:**
- [ ] The file `lib/algorithms/types.ts` is created.
- [ ] It exports the following types and interfaces as defined in the requirements:
  - `TraceEvent` (union type for 'visit', 'relax', 'finish')
  - `TraceFunction`
  - `PathfindingResult`
  - `PathfindingAlgorithm`
- [ ] The project's type-checker passes without errors.

---

### Task 2: Implement Pure Dijkstra Algorithm

**Scope:** Refactor the existing Dijkstra algorithm to be a pure, stateless function that conforms to the new `PathfindingAlgorithm` interface. It should not contain any UI or visualization-specific code.

**Files to Create:**
- `lib/algorithms/core/dijkstra.ts`

**Acceptance Criteria:**
- [ ] The directory `lib/algorithms/core/` is created.
- [ ] The file `lib/algorithms/core/dijkstra.ts` is created inside it.
- [ ] The file exports a function `dijkstra` that has the `PathfindingAlgorithm` signature.
- [ ] The function correctly implements Dijkstra's algorithm using the provided `graph`, `startId`, and `endId`.
- [ ] The function calls the provided `trace` callback with the correct `TraceEvent` payload during its execution.
- [ ] The function returns a `PathfindingResult` with the final path and distances.

---

### Task 3: Create the Generic Algorithm Tracer

**Scope:** Implement the generic `traceAlgorithm` function that can execute any `PathfindingAlgorithm` and capture its full execution history as an array of events.

**Files to Create:**
- `lib/algorithms/visualization/tracer.ts`

**Acceptance Criteria:**
- [ ] The directory `lib/algorithms/visualization/` is created.
- [ ] The file `lib/algorithms/visualization/tracer.ts` is created inside it.
- [ ] The file exports the `traceAlgorithm` function.
- [ ] The function takes a `PathfindingAlgorithm` function as an argument.
- [ ] It correctly returns a `TraceEvent[]` array (a "trace log") that represents the complete execution of the given algorithm.

---

### Task 4: Implement the UI Trace Stepper

**Scope:** Create a new UI-facing stepper class that can interpret a "trace log" and generate the correct visualization state for each step.

**Files to Create:**
- `lib/algorithms/visualization/TraceStepper.ts`

**Acceptance Criteria:**
- [ ] The file `lib/algorithms/visualization/TraceStepper.ts` is created.
- [ ] It exports a `TraceStepper` class and a `VisualizationState` interface.
- [ ] The `TraceStepper` constructor accepts a `TraceEvent[]` log.
- [ ] The class has a `.next()` method that processes one event from the log and updates its public `state` property.
- [ ] The `state` property correctly reflects the cumulative state of the visualization at the current step (e.g., `visited` set, `distances`, `frontier`).
- [ ] The `state.done` property is set to `true` only after the last event in the log has been processed.

---

### Task 5: Integrate New Architecture in the UI

**Scope:** This is the final integration step. Rewire the `GraphSimulator` component to use the new, modular system. This will replace the direct dependency on `DijkstraStepper`.

**Files to Modify:**
- `components/GraphSimulator.tsx`

**Acceptance Criteria:**
- [ ] `GraphSimulator.tsx` no longer imports or references the old `DijkstraStepper`.
- [ ] The component now imports `dijkstra`, `traceAlgorithm`, and `TraceStepper`.
- [ ] On initialization, the component calls `traceAlgorithm(dijkstra, ...)` to generate the complete trace log.
- [ ] It then creates an instance of `TraceStepper` with this log.
- [ ] The `doStep`, `onReset`, and play/pause logic are all updated to use the `TraceStepper` instance.
- [ ] The props passed to `GraphCanvas` (e.g., `highlightVisited`, `highlightPath`) are now derived from the `TraceStepper.state`.
- [ ] **Crucially, the application's visualization behavior is identical to the behavior before the refactor.**

---

### Task 6: Cleanup

**Scope:** Remove the old, now-redundant `DijkstraStepper` code.

**Files to Delete:**
- `lib/algorithms/dijkstra.ts`

**Acceptance Criteria:**
- [ ] The file `lib/algorithms/dijkstra.ts` is deleted.
- [ ] The project builds, lints, and runs without any errors.
