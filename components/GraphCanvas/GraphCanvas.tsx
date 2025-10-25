'use client'
import React from 'react'
import type {GraphNode, NodeId} from '@/lib/graph/types'
import {findBidirectionalEdges} from "@/lib/graph/graph_functions";
import GraphGrid from '@/components/GraphGrid'
import GraphEdgeItem from '@/components/GraphCanvas/GraphEdgeItem'
import GraphNodeItem from '@/components/GraphCanvas/GraphNodeItem'
import {
    ARROW_REF_X,
    ARROW_REF_Y,
    ARROW_SIZE,
    ARROW_SIZE_PATH,
    colors,
    VIEWBOX_H,
    VIEWBOX_MARGIN,
    VIEWBOX_W,
} from '@/lib/graph/graph_constants'
import {clientToNormalizedFromSvg} from "@/lib/graph/canvas_utils";
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
                {(graph.edges ?? []).map((e, i) => (
                    <GraphEdgeItem
                        key={`edge-${i}`}
                        edge={e}
                        nodeIndex={nodeIndex}
                        isDirected={isDirected}
                        isWeighted={isWeighted}
                        pathEdgeSet={pathEdgeSet}
                        relaxedEdgeSet={relaxedEdgeSet}
                        bidirectionalEdges={bidirectionalEdges}
                    />
                ))}
            </g>

            {/* Nodes */}
            <g>
                {(graph.nodes ?? []).map((n) => (
                    <GraphNodeItem
                        key={n.id}
                        id={n.id}
                        x={n.x}
                        y={n.y}
                        label={n.label ?? n.id}
                        isCurrent={n.id === highlightCurrent}
                        isVisited={visitedSet.has(n.id)}
                        inFrontier={frontierSet.has(n.id)}
                        inPath={pathSet.has(n.id)}
                        startId={startId}
                        endId={endId}
                        distance={distances?.[n.id]}
                        draggable={draggableNodes && !!onNodePositionChange}
                        onClick={() => onNodeClick?.(n.id)}
                        onDragStart={() => beginDragging(n.id)}
                    />
                ))}
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
