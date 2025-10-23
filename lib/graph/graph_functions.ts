import {GraphEdge} from "@/lib/graph/types";


export function findBidirectionalEdges(edges: GraphEdge[]): Set<{p1: GraphEdge, p2: GraphEdge}> {
    const foundPairs = new Set<{p1: GraphEdge, p2: GraphEdge}>()
    edges.forEach(edge => {
        const reverseEdge = edges.find(e => e.from === edge.to && e.to === edge.from)
        if (reverseEdge) {
            foundPairs.add({p1: edge, p2: reverseEdge})
        }
    })
    return foundPairs
}