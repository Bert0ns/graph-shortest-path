import { type Graph, GraphEdge, type GraphNode } from "@/lib/graph/types";


export function findBidirectionalEdges(edges: GraphEdge[]): Set<{ p1: GraphEdge, p2: GraphEdge }> {
    const foundPairs = new Set<{ p1: GraphEdge, p2: GraphEdge }>()
    edges.forEach(edge => {
        const reverseEdge = edges.find(e => e.from === edge.to && e.to === edge.from)
        if (reverseEdge) {
            foundPairs.add({ p1: edge, p2: reverseEdge })
        }
    })
    return foundPairs
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