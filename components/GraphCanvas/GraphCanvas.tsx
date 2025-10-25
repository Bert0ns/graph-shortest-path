'use client'
import React from 'react'
import type {GraphNode, NodeId} from '@/lib/graph/types'
import {GeometryLine, shortenLine, transformLineParallel} from "@/lib/geometry";
import {findBidirectionalEdges} from "@/lib/graph/graph_functions";
import GraphGrid from '@/components/GraphGrid'
import {
    ARROW_PULLBACK,
    ARROW_REF_X,
    ARROW_REF_Y,
    ARROW_SIZE,
    ARROW_SIZE_PATH,
    colors,
    DISTANCE_FONT_SIZE,
    DISTANCE_OFFSET,
    EDGE_NODE_GAP,
    EDGE_PARALLEL_OFFSET,
    EDGE_STROKE_WIDTH,
    END_RING_DASH,
    END_RING_DELTA,
    END_RING_STROKE_WIDTH,
    LABEL_FONT_SIZE,
    LABEL_OFFSET,
    NODE_ID_FONT_SIZE,
    NODE_RADIUS,
    NODE_STROKE_WIDTH,
    PATH_EDGE_STROKE_WIDTH,
    RELAXED_EDGE_STROKE_WIDTH,
    START_RING_DELTA,
    START_RING_STROKE_WIDTH,
    VIEWBOX_H,
    VIEWBOX_MARGIN,
    VIEWBOX_W,
    WEIGHT_LABEL_BASELINE_TWEAK,
    WEIGHT_LABEL_CHAR_WIDTH,
    WEIGHT_LABEL_FONT_SIZE,
    WEIGHT_LABEL_HEIGHT,
    WEIGHT_LABEL_PADDING,
} from '@/lib/graph/graph_constants'
import {clientToNormalizedFromSvg, convertToCanvasCoordinates} from "@/lib/graph/canvas_utils";
import {GraphCanvasProps} from "@/components/GraphCanvas/GraphCanvasProps";

export function GraphCanvas({
                                graph,
                                width = '100%',
                                height = 480,
                                onNodeClick,
                                highlightCurrent,
                                highlightVisited,
                                highlightFrontier,
                                highlightPath,
                                highlightRelaxedEdges,
                                distances,
                                startId,
                                endId,
                                showGrid = false,
                                draggableNodes = false,
                                onNodePositionChange,
                            }: GraphCanvasProps) {
    const svgRef = React.useRef<SVGSVGElement | null>(null)
    const draggingIdRef = React.useRef<string | null>(null)

    const nodeIndex = React.useMemo((): Map<NodeId, GraphNode> => new Map((graph?.nodes ?? []).map(n => [n.id, n])), [graph])
    const isDirected = !!graph?.metadata?.directed
    const isWeighted = !!graph?.metadata?.weighted

    const bidirectionalEdges = React.useMemo(() => findBidirectionalEdges(graph?.edges ?? []), [graph])

    // Prepare sets
    const visitedSet: Set<string> = React.useMemo(() => {
        if (!highlightVisited) return new Set()
        return highlightVisited instanceof Set ? new Set(highlightVisited) : new Set(highlightVisited)
    }, [highlightVisited])
    const frontierSet: Set<string> = React.useMemo(() => new Set(highlightFrontier ?? []), [highlightFrontier])
    const pathSet: Set<string> = React.useMemo(() => new Set(highlightPath ?? []), [highlightPath])
    const pathEdgeSet: Set<string> = React.useMemo(() => {
        const s = new Set<string>()
        if (!highlightPath || highlightPath.length < 2) return s
        for (let i = 0; i < highlightPath.length - 1; i++) {
            const a = highlightPath[i]!
            const b = highlightPath[i + 1]!
            s.add(`${a}->${b}`)
        }
        return s
    }, [highlightPath])
    const relaxedEdgeSet: Set<string> = React.useMemo(() => {
        const s = new Set<string>()
        for (const re of highlightRelaxedEdges ?? []) s.add(`${re.from}->${re.to}`)
        return s
    }, [highlightRelaxedEdges])

    const clientToNormalized = React.useCallback((clientX: number, clientY: number) => clientToNormalizedFromSvg(svgRef.current, clientX, clientY, VIEWBOX_W, VIEWBOX_H, VIEWBOX_MARGIN), [svgRef])

    //Mouse dragging handlers
    const handleGlobalMouseMove = React.useCallback((e: MouseEvent) => {
        if (!draggableNodes) return
        const id = draggingIdRef.current
        if (!id) return
        const {x, y} = clientToNormalized(e.clientX, e.clientY)
        onNodePositionChange?.(id, x, y)
    }, [clientToNormalized, draggableNodes, onNodePositionChange])
    const endDragging = React.useCallback(function onMouseUp() {
        draggingIdRef.current = null
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
    }, [handleGlobalMouseMove])
    const beginDragging = React.useCallback((id: NodeId) => {
        if (!draggableNodes) return
        draggingIdRef.current = id
        window.addEventListener('mousemove', handleGlobalMouseMove)
        window.addEventListener('mouseup', endDragging)
    }, [draggableNodes, handleGlobalMouseMove, endDragging])

    const content = graph ? (
        <>
            {/* Edges */}
            <g>
                {(graph.edges ?? []).map((e, i) => {
                    const from = nodeIndex.get(e.from)
                    const to = nodeIndex.get(e.to)
                    if (!from || !to) return null
                    const p1 = convertToCanvasCoordinates(from.x, from.y)
                    const p2 = convertToCanvasCoordinates(to.x, to.y)
                    let arcLine: GeometryLine = {x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y}
                    // Pull back both ends so lines do not intersect node circles
                    const endGap = isDirected ? NODE_RADIUS + ARROW_PULLBACK : NODE_RADIUS + EDGE_NODE_GAP
                    arcLine = shortenLine(arcLine, NODE_RADIUS + EDGE_NODE_GAP, endGap)

                    // Adjust for bidirectional edges
                    const offset = EDGE_PARALLEL_OFFSET
                    if (isDirected) {
                        const _ = Array.from(bidirectionalEdges)
                        const pair1 = _.find(p => (p.p1 === e))
                        const pair2 = _.find(p => (p.p2 === e))
                        if (!!pair1) {
                            arcLine = transformLineParallel(arcLine, offset)
                        } else if (!!pair2) {
                            arcLine = transformLineParallel(arcLine, -offset)
                        }
                    }
                    const {x1, y1, x2, y2} = arcLine
                    const mid = {x: (x1 + x2) / 2, y: (y1 + y2) / 2}

                    // Determine edge style
                    const key = `${e.from}->${e.to}`
                    const isPathEdge = pathEdgeSet.has(key)
                    const isRelaxed = relaxedEdgeSet.has(key)
                    const stroke = isPathEdge ? colors.pathStroke : isRelaxed ? colors.relaxedStroke : colors.edge
                    const width = isPathEdge ? PATH_EDGE_STROKE_WIDTH : isRelaxed ? RELAXED_EDGE_STROKE_WIDTH : EDGE_STROKE_WIDTH
                    const markerId = isDirected ? (isPathEdge ? 'url(#arrow-path)' : isRelaxed ? 'url(#arrow-relaxed)' : 'url(#arrow-default)') : undefined

                    // Weight label sizing
                    const weightText = String(e.weight ?? '')
                    const bubbleWidth = WEIGHT_LABEL_PADDING + weightText.length * WEIGHT_LABEL_CHAR_WIDTH

                    return (
                        <g key={`edge-${i}`}>
                            <line
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={stroke}
                                strokeWidth={width}
                                markerEnd={markerId}
                            />
                            {isWeighted && (
                                <g transform={`translate(${mid.x}, ${mid.y})`} style={{pointerEvents: 'none'}}>
                                    <rect
                                        x={-bubbleWidth / 2}
                                        y={-WEIGHT_LABEL_HEIGHT / 2}
                                        width={bubbleWidth}
                                        height={WEIGHT_LABEL_HEIGHT}
                                        rx={WEIGHT_LABEL_HEIGHT / 2}
                                        ry={WEIGHT_LABEL_HEIGHT / 2}
                                        fill="#ffffff"
                                        opacity={0.8}
                                    />
                                    <text x={0} y={WEIGHT_LABEL_FONT_SIZE / 2 - WEIGHT_LABEL_BASELINE_TWEAK}
                                          textAnchor="middle" fontSize={WEIGHT_LABEL_FONT_SIZE} fill={colors.text}
                                          style={{fontWeight: 500}}>
                                        {e.weight}
                                    </text>
                                </g>
                            )}
                        </g>
                    )
                })}
            </g>

            {/* Nodes */}
            <g>
                {(graph.nodes ?? []).map((n) => {
                    const p = convertToCanvasCoordinates(n.x, n.y)
                    const label = n.label ?? n.id
                    const isCurrent = n.id === highlightCurrent
                    const isVisited = visitedSet.has(n.id)
                    const inFrontier = frontierSet.has(n.id)
                    const inPath = pathSet.has(n.id)

                    // Node style precedence: current > visited > frontier > path > base
                    let fill = colors.nodeFill
                    let stroke = colors.nodeStroke
                    if (inPath) {
                        fill = colors.pathFill;
                        stroke = colors.pathStroke
                    }
                    if (inFrontier) {
                        fill = colors.frontierFill;
                        stroke = colors.frontierStroke
                    }
                    if (isVisited) {
                        fill = colors.visitedFill;
                        stroke = colors.visitedStroke
                    }
                    if (isCurrent) {
                        fill = colors.currentFill;
                        stroke = colors.currentStroke
                    }

                    const dVal = distances?.[n.id]
                    const hasDist = typeof dVal === 'number' && isFinite(dVal)

                    const draggable = draggableNodes && !!onNodePositionChange
                    const cursor = draggable ? 'grab' : 'pointer'
                    const nodeHint = draggable ? `Drag to reposition node ${n.id}` : `Click to select ${n.id} as start/end`

                    return (
                        <g key={n.id}
                           className="select-none"
                           style={{cursor}}
                           onClick={() => onNodeClick?.(n.id)}
                           onMouseDown={(e) => {
                               if (!draggable) return
                               e.preventDefault()
                               beginDragging(n.id)
                           }}
                        >
                            <title>{nodeHint}</title>
                            {/* Start/End outer rings */}
                            {startId === n.id && (
                                <circle cx={p.x} cy={p.y} r={NODE_RADIUS + START_RING_DELTA} fill="none"
                                        stroke={colors.startRing} strokeWidth={START_RING_STROKE_WIDTH}/>
                            )}
                            {endId === n.id && (
                                <circle cx={p.x} cy={p.y} r={NODE_RADIUS + END_RING_DELTA} fill="none"
                                        stroke={colors.endRing} strokeWidth={END_RING_STROKE_WIDTH}
                                        strokeDasharray={END_RING_DASH}/>
                            )}

                            {/* Core circle */}
                            <circle cx={p.x} cy={p.y} r={NODE_RADIUS} fill={fill} stroke={stroke}
                                    strokeWidth={NODE_STROKE_WIDTH}/>

                            {/* Node ID inside the circle */}
                            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                                  fontSize={NODE_ID_FONT_SIZE} fill={colors.text} style={{fontWeight: 600}}>
                                {n.id}
                            </text>
                            {/* External label above the node (if distinct) */}
                            {label !== n.id && (
                                <text x={p.x} y={p.y - NODE_RADIUS - LABEL_OFFSET} textAnchor="middle"
                                      fontSize={LABEL_FONT_SIZE} fill={colors.text}>
                                    {label}
                                </text>
                            )}
                            {/* Tentative distance below the node (if provided) */}
                            {hasDist && (
                                <text x={p.x} y={p.y + NODE_RADIUS + DISTANCE_OFFSET} textAnchor="middle"
                                      fontSize={DISTANCE_FONT_SIZE} fill={colors.distanceText}>
                                    {dVal}
                                </text>
                            )}
                        </g>
                    )
                })}
            </g>
        </>
    ) : (
        <g>
            <text x={VIEWBOX_W / 2} y={VIEWBOX_H / 2} textAnchor="middle" dominantBaseline="middle"
                  fill="#64748b">Loading…
            </text>
        </g>
    )

    return (
        <div style={{width, height}} className="w-full h-full">
            <svg ref={svgRef} viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                 className="w-full h-full bg-white/50 border border-slate-200 rounded">
                <defs>
                    {/* default arrowhead */}
                    <marker id="arrow-default" viewBox="0 0 10 10" refX={ARROW_REF_X} refY={ARROW_REF_Y}
                            markerWidth={ARROW_SIZE} markerHeight={ARROW_SIZE} orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.edgeActive}/>
                    </marker>
                    {/* relaxed arrowhead */}
                    <marker id="arrow-relaxed" viewBox="0 0 10 10" refX={ARROW_REF_X} refY={ARROW_REF_Y}
                            markerWidth={ARROW_SIZE} markerHeight={ARROW_SIZE} orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.relaxedStroke}/>
                    </marker>
                    {/* path arrowhead */}
                    <marker id="arrow-path" viewBox="0 0 10 10" refX={ARROW_REF_X} refY={ARROW_REF_Y}
                            markerWidth={ARROW_SIZE_PATH} markerHeight={ARROW_SIZE_PATH} orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.pathStroke}/>
                    </marker>
                </defs>

                {/* Grid */}
                {showGrid ? <GraphGrid/> : null}

                {content}
            </svg>
        </div>
    )
}

export default GraphCanvas
