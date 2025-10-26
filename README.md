# Graph Shortest Path

Brief presentation: this project implements and visualizes algorithms for computing shortest paths on graphs. Suitable for learning, experimentation and integration into React applications.

Technologies:
- Nextjs
- TypeScript, JavaScript
- React
- Tailwind CSS
- shadcn UI components
- SVG for graph rendering

Key features:
- Implementations of classic algorithms: Dijkstra
- Interactive visualizer to create nodes and edges and observe execution step\-by\-step.
- Simple API to integrate path computations into other components.

Installation:
1. `npm install`
2. `npm run dev`

Project structure (essential):
- `src/` \- React/TypeScript source code
- `public/` \- static assets
- `README.md` \- this presentation

Contributing:
- Fork, create a feature branch and open a pull request against `main`.
- Add tests and documentation for new features.

## Architecture

The pathfinding visualization is built on a decoupled architecture that separates the core algorithm logic from the UI rendering. This makes it easy to add new algorithms without changing the UI code.

### How it Works

1.  **Pure Algorithm:** The pathfinding algorithms (e.g., `dijkstra` in `lib/algorithms/core/dijkstra.ts`) are implemented as pure functions. They take a graph and start/end nodes as input and use a `trace` callback function to report their progress as a series of `TraceEvent`s.
2.  **Tracer:** The `traceAlgorithm` function (`lib/algorithms/visualization/tracer.ts`) wraps the pure algorithm and records all the `TraceEvent`s into a log.
3.  **TraceStepper:** The `TraceStepper` class (`lib/algorithms/visualization/TraceStepper.ts`) takes the `traceLog` and generates a `VisualizationState` object for each step of the algorithm's execution.
4.  **UI:** The `GraphSimulator` component uses the `TraceStepper` to get the `VisualizationState` for each step and passes it to the `GraphCanvas` component, which handles the rendering.

### Adding a New Algorithm

To add a new pathfinding algorithm (e.g., A*), follow these steps:

1.  **Create the Algorithm File:** Create a new file in `lib/algorithms/core/` (e.g., `astar.ts`).
2.  **Implement the Algorithm:** Implement your algorithm as a pure function with the `PathfindingAlgorithm` signature from `lib/algorithms/types.ts`.
    ```typescript
    import { PathfindingAlgorithm } from '../types';

    export const astar: PathfindingAlgorithm = (graph, startId, endId, trace) => {
      // Your algorithm implementation here...
      // Call the trace function with TraceEvents to report progress.
      // e.g., trace({ type: 'visit', nodeId: 'A', distance: 10 });
      // ...
      // Return the final path and distances.
      return { path: [], distances: {} };
    };
    ```
3.  **Register the Algorithm:** In `components/GraphSimulator.tsx`, import your new algorithm and add it to the `ALGORITHMS` and `ALGORITHM_NAMES` maps.

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

The UI will update automatically to include the new algorithm in the selection dropdown. This decoupled approach ensures that your new algorithm will work with the existing visualization system without any further changes.