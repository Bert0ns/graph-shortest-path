import type {Graph, NodeId} from '@/lib/graph/types'
import {VisualizationState} from "@/lib/algorithms/visualization/TraceStepper";

export interface GraphCanvasProps {
    graph: Graph | null
    width?: number | string
    height?: number | string
    onNodeClick?: (id: NodeId) => void
    visualizationState: VisualizationState | null
    startId?: NodeId
    endId?: NodeId
    showGrid?: boolean
    draggableNodes?: boolean
    onNodePositionChange?: (id: NodeId, x: number, y: number) => void
}
