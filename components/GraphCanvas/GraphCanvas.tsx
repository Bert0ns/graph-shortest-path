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
                                visualizationState,
                                startId,
                                endId,
                                showGrid = false,
                                draggableNodes = false,
                                onNodePositionChange,
                            }: GraphCanvasProps) {
    const svgRef = React.useRef<SVGSVGElement | null>(null)
    const draggingIdRef = React.useRef<string | null>(null)
    const draggableNodesRef = React.useRef(draggableNodes)
    const onNodePositionChangeRef = React.useRef(onNodePositionChange)
    const rafIdRef = React.useRef<number | null>(null)
    const isDraggingRef = React.useRef(false)

    React.useEffect(() => { draggableNodesRef.current = draggableNodes }, [draggableNodes])
    React.useEffect(() => { onNodePositionChangeRef.current = onNodePositionChange }, [onNodePositionChange])

    // Derived graph flags and indexes
    const nodeIndex = React.useMemo((): Map<NodeId, GraphNode> => new Map((graph?.nodes ?? []).map(n => [n.id, n])), [graph])
    const isDirected = !!graph?.metadata?.directed
    const isWeighted = !!graph?.metadata?.weighted
    const bidirectionalEdges = React.useMemo(() => findBidirectionalEdges(graph?.edges ?? []), [graph])

    // Stable global mousemove handler (throttled by rAF)
    const handleGlobalMouseMove = React.useCallback((e: MouseEvent) => {
        const id = draggingIdRef.current
        if (!id || !draggableNodesRef.current) return
        if (rafIdRef.current != null) return
        const { clientX, clientY } = e
        rafIdRef.current = window.requestAnimationFrame(() => {
            rafIdRef.current = null
            const { x, y } = clientToNormalizedFromSvg(svgRef.current, clientX, clientY, VIEWBOX_W, VIEWBOX_H, VIEWBOX_MARGIN)
            isDraggingRef.current = true
            onNodePositionChangeRef.current?.(id, x, y)
        })
    }, [])

    const endDragging = React.useCallback(function onMouseUp() {
        draggingIdRef.current = null
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        if (rafIdRef.current != null) {
            window.cancelAnimationFrame(rafIdRef.current)
            rafIdRef.current = null
        }
        // Defer reset so a click immediately after drag is ignored once
        setTimeout(() => { isDraggingRef.current = false }, 0)
    }, [handleGlobalMouseMove])

    const beginDragging = React.useCallback((id: NodeId) => {
        if (!draggableNodesRef.current) return
        draggingIdRef.current = id
        isDraggingRef.current = false
        window.addEventListener('mousemove', handleGlobalMouseMove)
        window.addEventListener('mouseup', endDragging)
    }, [handleGlobalMouseMove, endDragging])

    React.useEffect(() => {
        return () => {
            // Cleanup on unmount in case a drag was in progress
            window.removeEventListener('mousemove', handleGlobalMouseMove)
            window.removeEventListener('mouseup', endDragging)
            if (rafIdRef.current != null) {
                window.cancelAnimationFrame(rafIdRef.current)
                rafIdRef.current = null
            }
            draggingIdRef.current = null
        }
    }, [handleGlobalMouseMove, endDragging])

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
                        isPath={visualizationState?.edges[`${e.from}-${e.to}`]?.isPath ?? false}
                        isRelaxed={visualizationState?.relaxedEdgeId === `${e.from}-${e.to}`}
                        bidirectionalEdges={bidirectionalEdges}
                    />
                ))}
            </g>

            {/* Nodes */}
            <g>
                {(graph.nodes ?? []).map((n) => {
                    const nodeState = visualizationState?.nodes[n.id]
                    return (
                        <GraphNodeItem
                            key={n.id}
                            id={n.id}
                            x={n.x}
                            y={n.y}
                            label={n.label ?? n.id}
                            isCurrent={visualizationState?.currentNodeId === n.id}
                            isVisited={nodeState?.isVisited ?? false}
                            inFrontier={visualizationState?.frontier.includes(n.id) ?? false}
                            inPath={nodeState?.isPath ?? false}
                            startId={startId}
                            endId={endId}
                            distance={nodeState?.distance}
                            draggable={draggableNodes && !!onNodePositionChange}
                            onClick={() => { if (!isDraggingRef.current) onNodeClick?.(n.id) }}
                            onDragStart={() => beginDragging(n.id)}
                        />
                    )
                })}
            </g>
        </>
    ) : (
        <g>
            <text
                x={VIEWBOX_W / 2}
                y={VIEWBOX_H / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#64748b">Loading…
            </text>
        </g>
    )

    return (
        <div style={{width, height}} className="w-full h-full">
            <svg ref={svgRef} viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} preserveAspectRatio="xMidYMid meet"
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
