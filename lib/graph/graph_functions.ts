import {type Graph, GraphEdge, type GraphNode} from "@/lib/graph/types";


export function findBidirectionalEdges(edges: GraphEdge[]): Set<{ p1: GraphEdge, p2: GraphEdge }> {
    const foundPairs = new Set<{ p1: GraphEdge, p2: GraphEdge }>();
    const processed = new Set<GraphEdge>();

    for (const edge1 of edges) {
        if (processed.has(edge1)) continue;

        const reverseEdge = edges.find(edge2 =>
            !processed.has(edge2) &&
            edge1.from === edge2.to &&
            edge1.to === edge2.from
        );

        if (reverseEdge) {
            foundPairs.add({ p1: edge1, p2: reverseEdge });
            processed.add(edge1);
            processed.add(reverseEdge);
        }
    }
    return foundPairs;
}

export function isEdgeDuplicate(graph: Graph, edge: GraphEdge): boolean {
    let dup: GraphEdge | undefined
    if (graph.metadata.directed) {
        dup = graph.edges.find((e: GraphEdge) => {
            return e.from === edge.from && e.to === edge.to
        })
    } else {
        dup = graph.edges.find((e: GraphEdge) => {
            return (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
        })
    }

    return !!dup
}

export function isNodeDuplicate(graph: Graph, node: GraphNode): boolean {
    const dup = graph.nodes.find((n: GraphNode) => n.id === node.id)
    return !!dup
}

export function isEdgeAutoLoop(edge: GraphEdge): boolean {
    return edge.from === edge.to
}