// Graph schema types (Version 1)
export type NodeId = string;

export interface GraphMetadata {
  directed: boolean;
  weighted: boolean;
  name?: string;
  description?: string;
}

export interface GraphNode {
  id: NodeId;
  // Normalized coordinates in [0,1] for both x and y
  x: number;
  y: number;
  label?: string;
}

export interface GraphFile {
  metadata: GraphMetadata;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphEdge {
  from: NodeId;
  to: NodeId;
  weight: number;
  label?: string;
}

export interface Graph {
  metadata: GraphMetadata;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

