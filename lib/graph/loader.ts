import type { GraphFile, Graph, GraphEdge } from "./types";

// TODO: implement real validation per REQUIREMENTS.md
export function validateGraphFileV1(file: GraphFile): { ok: true } | { ok: false; errors: string[] } {

    return { ok: true };
}

// Resolve file format into runtime Graph structure
export function resolveGraph(file: GraphFile): Graph {
  return {
    metadata: file.metadata,
    nodes: file.nodes,
    edges: file.edges.map((e: GraphEdge) => ({
      from: e.from,
      to: e.to,
      weight: e.weight,
      label: e.label,
    })),
  };
}
