'use client'

import React from 'react'
import type {GraphEdge, GraphNode, NodeId} from '@/lib/graph/types'
import {GeometryLine, shortenLine, transformLineParallel} from '@/lib/geometry'
import {
    ARROW_PULLBACK,
    colors,
    EDGE_NODE_GAP,
    EDGE_PARALLEL_OFFSET,
    EDGE_STROKE_WIDTH,
    NODE_RADIUS,
    PATH_EDGE_STROKE_WIDTH,
    RELAXED_EDGE_STROKE_WIDTH,
    WEIGHT_LABEL_BASELINE_TWEAK,
    WEIGHT_LABEL_CHAR_WIDTH,
    WEIGHT_LABEL_FONT_SIZE,
    WEIGHT_LABEL_HEIGHT,
    WEIGHT_LABEL_PADDING,
} from '@/lib/graph/graph_constants'
import {convertToCanvasCoordinates} from '@/lib/graph/canvas_utils'

export interface GraphEdgeItemProps {
    edge: GraphEdge
    nodeIndex: Map<NodeId, GraphNode>
    isDirected: boolean
    isWeighted: boolean
    isPath: boolean
    isRelaxed: boolean
    bidirectionalEdges: Set<{ p1: GraphEdge, p2: GraphEdge }>
}

export const GraphEdgeItem: React.FC<GraphEdgeItemProps> = ({
                                                                edge,
                                                                nodeIndex,
                                                                isDirected,
                                                                isWeighted,
                                                                isPath,
                                                                isRelaxed,
                                                                bidirectionalEdges,
                                                            }) => {
    const from = nodeIndex.get(edge.from)
    const to = nodeIndex.get(edge.to)
    if (!from || !to) return null

    const p1 = convertToCanvasCoordinates(from.x, from.y)
    const p2 = convertToCanvasCoordinates(to.x, to.y)

    let arcLine: GeometryLine = {x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y}
    const endGap = isDirected ? NODE_RADIUS + ARROW_PULLBACK : NODE_RADIUS + EDGE_NODE_GAP
    arcLine = shortenLine(arcLine, NODE_RADIUS + EDGE_NODE_GAP, endGap)

    if (isDirected) {
        // Bidirectional offset to avoid overlap of opposite edges
        const pairs = Array.from(bidirectionalEdges)
        const pair1 = pairs.find((p) => p.p1 === edge)
        const pair2 = pairs.find((p) => p.p2 === edge)
        if (pair1) arcLine = transformLineParallel(arcLine, EDGE_PARALLEL_OFFSET)
        else if (pair2) arcLine = transformLineParallel(arcLine, -EDGE_PARALLEL_OFFSET)
    }

    const {x1, y1, x2, y2} = arcLine
    const mid = {x: (x1 + x2) / 2, y: (y1 + y2) / 2}

    const stroke = isPath ? colors.edge.path : isRelaxed ? colors.edge.relaxed : colors.edge.normal
    const width = isPath ? PATH_EDGE_STROKE_WIDTH : isRelaxed ? RELAXED_EDGE_STROKE_WIDTH : EDGE_STROKE_WIDTH
    const markerId = isDirected
        ? isPath
            ? 'url(#arrow-path)'
            : isRelaxed
                ? 'url(#arrow-relaxed)'
                : 'url(#arrow-default)'
        : undefined

    const weightText = String(edge.weight ?? '')
    const bubbleWidth = WEIGHT_LABEL_PADDING + weightText.length * WEIGHT_LABEL_CHAR_WIDTH

    return (
        <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={width} markerEnd={markerId}/>
            {isWeighted && weightText.length > 0 && (
                <g transform={`translate(${mid.x}, ${mid.y})`} style={{pointerEvents: 'none'}}>
                    <rect
                        x={-bubbleWidth / 2}
                        y={-WEIGHT_LABEL_HEIGHT / 2}
                        width={bubbleWidth}
                        height={WEIGHT_LABEL_HEIGHT}
                        rx={WEIGHT_LABEL_HEIGHT / 2}
                        ry={WEIGHT_LABEL_HEIGHT / 2}
                        fill={colors.edge.weightBackground}
                        opacity={0.8}
                    />
                    <text
                        x={0}
                        y={WEIGHT_LABEL_FONT_SIZE / 2 - WEIGHT_LABEL_BASELINE_TWEAK}
                        textAnchor="middle"
                        fontSize={WEIGHT_LABEL_FONT_SIZE}
                        fill={colors.edge.text}
                        style={{fontWeight: 500}}
                    >
                        {edge.weight}
                    </text>
                </g>
            )}
        </g>
    )
}

export default GraphEdgeItem
