import type { GraphFile, Graph, GraphEdge } from "./types";

// TODO: implement real validation per REQUIREMENTS.md
export function validateGraphFileV1(_file: GraphFile): { ok: true } | { ok: false; errors: string[] } {
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

// Convenience default sample path from public/graphs
export const GRAPH_SAMPLE_PATH = "/graphs/sample.json";

// Fetch and construct a Graph from a URL (client-side)
export async function loadGraphFromUrl(url: string): Promise<Graph> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load graph: ${res.status}`);
  const json = (await res.json()) as GraphFile;
  // In future: run validateGraphFileV1(json) and surface user-friendly errors
  return resolveGraph(json);
}
