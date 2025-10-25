import {Graph, NodeId} from "@/lib/graph/types";
import {DistanceMap, RelaxedEdge} from "@/lib/algorithms/dijkstra";


export interface GraphCanvasProps {
    graph: Graph | null
    width?: number | string
    height?: number | string
    onNodeClick?: (id: NodeId) => void
    // Highlights
    highlightCurrent?: NodeId
    highlightVisited?: Set<NodeId> | NodeId[]
    highlightFrontier?: NodeId[]
    highlightPath?: NodeId[]
    highlightRelaxedEdges?: RelaxedEdge[]
    distances?: DistanceMap
    startId?: NodeId
    endId?: NodeId
    // Rendering options
    showGrid?: boolean
    // Builder interactions
    draggableNodes?: boolean
    onNodePositionChange?: (id: NodeId, x: number, y: number) => void
}
