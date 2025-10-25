'use client'

import React from 'react'
import type {Graph} from '@/lib/graph/types'
import {GeometryLine, shortenLine, transformLineParallel} from "@/lib/geometry";
import type { RelaxedEdge, DistanceMap } from '@/lib/algorithms/dijkstra'
import {findBidirectionalEdges} from "@/lib/graph/graph_functions";
import {
  VIEWBOX_W as VB_W,
  VIEWBOX_H as VB_H,
  VIEWBOX_MARGIN as MARGIN,
  NODE_RADIUS as RADIUS,
  NODE_STROKE_WIDTH,
  NODE_ID_FONT_SIZE,
  LABEL_FONT_SIZE,
  LABEL_OFFSET,
  DISTANCE_FONT_SIZE,
  DISTANCE_OFFSET,
  EDGE_STROKE_WIDTH,
  PATH_EDGE_STROKE_WIDTH,
  RELAXED_EDGE_STROKE_WIDTH,
  EDGE_NODE_GAP,
  EDGE_PARALLEL_OFFSET,
  ARROW_SIZE,
  ARROW_SIZE_PATH,
  ARROW_PULLBACK,
  ARROW_REF_X,
  START_RING_DELTA,
  START_RING_STROKE_WIDTH,
  END_RING_DELTA,
  END_RING_STROKE_WIDTH,
  END_RING_DASH,
  WEIGHT_LABEL_FONT_SIZE,
  WEIGHT_LABEL_HEIGHT,
  WEIGHT_LABEL_PADDING,
  WEIGHT_LABEL_CHAR_WIDTH,
  ARROW_REF_Y,
  WEIGHT_LABEL_BASELINE_TWEAK,
} from '@/lib/graph/graph_constants'

export interface GraphCanvasProps {
  graph: Graph | null
  width?: number | string
  height?: number | string
  onNodeClick?: (id: string) => void
  // Highlights
  highlightCurrent?: string
  highlightVisited?: Set<string> | string[]
  highlightFrontier?: string[]
  highlightPath?: string[]
  highlightRelaxedEdges?: RelaxedEdge[]
  distances?: DistanceMap
  startId?: string
  endId?: string
}

export const convertToCanvasCoordinates = (x: number, y: number) => ({
    x: MARGIN + x * (VB_W - 2 * MARGIN),
    y: MARGIN + y * (VB_H - 2 * MARGIN),
})

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
}: GraphCanvasProps) {
  // Early empty state
  if (!graph) {
    return (
      <div style={{ width, height }} className="w-full h-full flex items-center justify-center text-slate-600 border border-slate-200 rounded">
        Loading…
      </div>
    )
  }

  const radius = RADIUS
  const arrowPullback = ARROW_PULLBACK
  const arcStrokeWidth = EDGE_STROKE_WIDTH

  // Base palette
  const colors = {
    edge: '#94a3b8', // slate-400
    edgeActive: '#64748b', // slate-500
    nodeFill: '#A7F3D0', // emerald-200 (legend Node)
    nodeStroke: '#34D399', // emerald-400
    text: '#334155', // slate-700
    // Highlights
    frontierFill: '#BFDBFE', frontierStroke: '#60A5FA', // blue-200/blue-400
    currentFill: '#FDE68A', currentStroke: '#F59E0B', // amber-200/amber-500
    visitedFill: '#FCA5A5', visitedStroke: '#F87171', // red-300/red-400
    pathFill: '#C4B5FD', pathStroke: '#8B5CF6', // violet-300/violet-600
    relaxedStroke: '#F59E0B', // amber-500 for relaxed edges
    startRing: '#10B981', // emerald-500
    endRing: '#6366F1', // indigo-500
    distanceText: '#cc0800', // slate-600 for distances
  }

  const nodeIndex = new Map(graph.nodes.map(n => [n.id, n]))
  const isDirected = !!graph.metadata?.directed
  const isWeighted = !!graph.metadata?.weighted

  const bidirectionalEdges = findBidirectionalEdges(graph.edges)

  // Prepare highlight sets (plain constants to avoid conditional hooks)
  const visitedSet: Set<string> = (() => {
    if (!highlightVisited) return new Set()
    return highlightVisited instanceof Set ? new Set(highlightVisited) : new Set(highlightVisited)
  })()
  const frontierSet: Set<string> = new Set(highlightFrontier ?? [])
  const pathSet: Set<string> = new Set(highlightPath ?? [])

  // Precompute set of path edges for styling
  const pathEdgeSet: Set<string> = (() => {
    const s = new Set<string>()
    if (!highlightPath || highlightPath.length < 2) return s
    for (let i = 0; i < highlightPath.length - 1; i++) {
      const a = highlightPath[i]!
      const b = highlightPath[i + 1]!
      s.add(`${a}->${b}`)
    }
    return s
  })()

  const relaxedEdgeSet: Set<string> = (() => {
    const s = new Set<string>()
    for (const re of highlightRelaxedEdges ?? []) s.add(`${re.from}->${re.to}`)
    return s
  })()

  return (
    <div style={{ width, height }} className="w-full h-full">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-full bg-white/50 border border-slate-200 rounded">
        <defs>
          {/* default arrowhead */}
          <marker id="arrow-default" viewBox="0 0 10 10" refX={ARROW_REF_X} refY={ARROW_REF_Y} markerWidth={ARROW_SIZE} markerHeight={ARROW_SIZE} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.edgeActive} />
          </marker>
          {/* relaxed arrowhead */}
          <marker id="arrow-relaxed" viewBox="0 0 10 10" refX={ARROW_REF_X} refY={ARROW_REF_Y} markerWidth={ARROW_SIZE} markerHeight={ARROW_SIZE} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.relaxedStroke} />
          </marker>
          {/* path arrowhead */}
          <marker id="arrow-path" viewBox="0 0 10 10" refX={ARROW_REF_X} refY={ARROW_REF_Y} markerWidth={ARROW_SIZE_PATH} markerHeight={ARROW_SIZE_PATH} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.pathStroke} />
          </marker>
        </defs>

        {/* Edges */}
        <g>
          {graph.edges.map((e, i) => {
            const from = nodeIndex.get(e.from)
            const to = nodeIndex.get(e.to)
            if (!from || !to) return null
            const p1 = convertToCanvasCoordinates(from.x, from.y)
            const p2 = convertToCanvasCoordinates(to.x, to.y)
            let arcLine: GeometryLine = {x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y}
            // Pull back both ends so lines do not intersect node circles
            const endGap = isDirected ? radius + arrowPullback : radius + EDGE_NODE_GAP
            arcLine = shortenLine(arcLine, radius + EDGE_NODE_GAP, endGap)

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
            const { x1, y1, x2, y2 } = arcLine
            const mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }

            // Determine edge style
            const key = `${e.from}->${e.to}`
            const isPathEdge = pathEdgeSet.has(key)
            const isRelaxed = relaxedEdgeSet.has(key)
            const stroke = isPathEdge ? colors.pathStroke : isRelaxed ? colors.relaxedStroke : colors.edge
            const width = isPathEdge ? PATH_EDGE_STROKE_WIDTH : isRelaxed ? RELAXED_EDGE_STROKE_WIDTH : arcStrokeWidth
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
                  <g transform={`translate(${mid.x}, ${mid.y})`} style={{ pointerEvents: 'none' }}>
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
                    <text x={0} y={WEIGHT_LABEL_FONT_SIZE / 2 - WEIGHT_LABEL_BASELINE_TWEAK} textAnchor="middle" fontSize={WEIGHT_LABEL_FONT_SIZE} fill={colors.text} style={{ fontWeight: 500 }}>
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
          {graph.nodes.map((n) => {
            const p = convertToCanvasCoordinates(n.x, n.y)
            const label = n.label ?? n.id
            const isCurrent = n.id === highlightCurrent
            const isVisited = visitedSet.has(n.id)
            const inFrontier = frontierSet.has(n.id)
            const inPath = pathSet.has(n.id)

            // Node style precedence: current > visited > frontier > path > base
            let fill = colors.nodeFill
            let stroke = colors.nodeStroke
            if (inPath) { fill = colors.pathFill; stroke = colors.pathStroke }
            if (inFrontier) { fill = colors.frontierFill; stroke = colors.frontierStroke }
            if (isVisited) { fill = colors.visitedFill; stroke = colors.visitedStroke }
            if (isCurrent) { fill = colors.currentFill; stroke = colors.currentStroke }

            const dVal = distances?.[n.id]
            const hasDist = typeof dVal === 'number' && isFinite(dVal)

            return (
              <g key={n.id} className="cursor-pointer" onClick={() => onNodeClick?.(n.id)}>
                {/* Start/End outer rings */}
                {startId === n.id && (
                  <circle cx={p.x} cy={p.y} r={radius + START_RING_DELTA} fill="none" stroke={colors.startRing} strokeWidth={START_RING_STROKE_WIDTH} />
                )}
                {endId === n.id && (
                  <circle cx={p.x} cy={p.y} r={radius + END_RING_DELTA} fill="none" stroke={colors.endRing} strokeWidth={END_RING_STROKE_WIDTH} strokeDasharray={END_RING_DASH} />
                )}

                {/* Core circle */}
                <circle cx={p.x} cy={p.y} r={radius} fill={fill} stroke={stroke} strokeWidth={NODE_STROKE_WIDTH} />

                {/* Node ID inside the circle */}
                <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={NODE_ID_FONT_SIZE} fill={colors.text} style={{ fontWeight: 600 }}>
                  {n.id}
                </text>
                {/* External label above the node (if distinct) */}
                {label !== n.id && (
                  <text x={p.x} y={p.y - radius - LABEL_OFFSET} textAnchor="middle" fontSize={LABEL_FONT_SIZE} fill={colors.text}>
                    {label}
                  </text>
                )}
                {/* Tentative distance below the node (if provided) */}
                {hasDist && (
                  <text x={p.x} y={p.y + radius + DISTANCE_OFFSET} textAnchor="middle" fontSize={DISTANCE_FONT_SIZE} fill={colors.distanceText}>
                    {dVal}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export default GraphCanvas
