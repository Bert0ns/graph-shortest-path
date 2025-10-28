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
import LoadingCanvas from "@/components/GraphCanvas/LoadingCanvas";

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

    // Derived graph flags and indexes
    const nodeIndex = React.useMemo((): Map<NodeId, GraphNode> => new Map((graph?.nodes ?? []).map(n => [n.id, n])), [graph])
    const isDirected = !!graph?.metadata?.directed
    const isWeighted = !!graph?.metadata?.weighted
    const bidirectionalEdges = React.useMemo(() => findBidirectionalEdges(graph?.edges ?? []), [graph])

    // Stable pointer handlers used directly on the SVG element
    const onPointerMove = React.useCallback((e: React.PointerEvent<SVGSVGElement>) => {
        const id = draggingIdRef.current
        if (!id) return
        const { x, y } = clientToNormalizedFromSvg(svgRef.current, e.clientX, e.clientY, VIEWBOX_W, VIEWBOX_H, VIEWBOX_MARGIN)
        onNodePositionChange?.(id, x, y)
    }, [onNodePositionChange])

    const onPointerUp = React.useCallback((e: React.PointerEvent<SVGSVGElement>) => {
        if (svgRef.current) {
            try { svgRef.current.releasePointerCapture(e.pointerId) } catch {}
        }
        draggingIdRef.current = null
    }, [])

    const beginDragging = React.useCallback((id: NodeId, e?: React.PointerEvent) => {
        if (!draggableNodes) return
        draggingIdRef.current = id
        if (svgRef.current && e) {
            try { svgRef.current.setPointerCapture(e.pointerId) } catch {}
        }
    }, [draggableNodes])

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
                            onClick={() => { onNodeClick?.(n.id) }}
                            onDragStart={(e) => beginDragging(n.id, e)}
                        />
                    )
                })}
            </g>
        </>
    ) : (
        <LoadingCanvas />
    )

    return (
        <div style={{width, height}} className="w-full h-full">
            <svg ref={svgRef} viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} preserveAspectRatio="xMidYMid meet"
                 className={"w-full h-full bg-white/50 border border-slate-200 rounded" + (draggableNodes ? " touch-none" : "")}
                 onPointerMove={onPointerMove}
                 onPointerUp={onPointerUp}
                 onPointerCancel={onPointerUp}
            >
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
