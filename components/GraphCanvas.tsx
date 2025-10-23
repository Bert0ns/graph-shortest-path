'use client'

import React from 'react'
import type {Graph} from '@/lib/graph/types'
import {GeometryLine, shortenLine, transformLineParallel} from "@/lib/geometry";
import type { RelaxedEdge, DistanceMap } from '@/lib/algorithms/dijkstra'
import {findBidirectionalEdges} from "@/lib/graph/graph_functions";

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

// ViewBox dimensions (logical units)
const VB_W = 100
const VB_H = 60
const MARGIN = 6 // logical units padding around the edges

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

  const radius = 3.2 // node circle radius in logical units
  const arrowPullback = 1.0 // extra gap to keep arrowheads out of node
  const arcStrokeWidth = 0.4

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
  const visitedSet: Set<string> = ((): Set<string> => {
    if (!highlightVisited) return new Set()
    return highlightVisited instanceof Set ? new Set(highlightVisited) : new Set(highlightVisited)
  })()
  const frontierSet: Set<string> = new Set(highlightFrontier ?? [])
  const pathSet: Set<string> = new Set(highlightPath ?? [])

  // Precompute set of path edges for styling
  const pathEdgeSet: Set<string> = ((): Set<string> => {
    const s = new Set<string>()
    if (!highlightPath || highlightPath.length < 2) return s
    for (let i = 0; i < highlightPath.length - 1; i++) {
      const a = highlightPath[i]!
      const b = highlightPath[i + 1]!
      s.add(`${a}->${b}`)
    }
    return s
  })()

  const relaxedEdgeSet: Set<string> = ((): Set<string> => {
    const s = new Set<string>()
    for (const re of highlightRelaxedEdges ?? []) s.add(`${re.from}->${re.to}`)
    return s
  })()

  return (
    <div style={{ width, height }} className="w-full h-full">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-full bg-white/50 border border-slate-200 rounded">
        <defs>
          {/* default arrowhead */}
          <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={4} markerHeight={4} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.edgeActive} />
          </marker>
          {/* relaxed arrowhead */}
          <marker id="arrow-relaxed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={4} markerHeight={4} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.relaxedStroke} />
          </marker>
          {/* path arrowhead */}
          <marker id="arrow-path" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={4.5} markerHeight={4.5} orient="auto-start-reverse">
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
            const endGap = isDirected ? radius + arrowPullback : radius + 0.6
            arcLine = shortenLine(arcLine, radius + 0.6, endGap)

            // Adjust for bidirectional edges
            const offset = 1.3
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
            const width = isPathEdge ? 0.8 : isRelaxed ? 0.6 : arcStrokeWidth
            const markerId = isDirected ? (isPathEdge ? 'url(#arrow-path)' : isRelaxed ? 'url(#arrow-relaxed)' : 'url(#arrow-default)') : undefined

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
                      x={-(1.5 + String(e.weight ?? '').length * 1.8) / 2}
                      y={-1.5}
                      width={1.5 + String(e.weight ?? '').length * 1.8}
                      height={3}
                      rx={1.5}
                      ry={1.5}
                      fill="#ffffff"
                      opacity={0.8}
                    />
                    <text x={0} y={1} textAnchor="middle" fontSize={3} fill={colors.text} style={{ fontWeight: 500 }}>
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
                  <circle cx={p.x} cy={p.y} r={radius + 1.2} fill="none" stroke={colors.startRing} strokeWidth={0.7} />
                )}
                {endId === n.id && (
                  <circle cx={p.x} cy={p.y} r={radius + 2.1} fill="none" stroke={colors.endRing} strokeWidth={0.7} strokeDasharray="2 1" />
                )}

                {/* Core circle */}
                <circle cx={p.x} cy={p.y} r={radius} fill={fill} stroke={stroke} strokeWidth={0.9} />

                {/* Node ID inside the circle */}
                <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={2.8} fill={colors.text} style={{ fontWeight: 600 }}>
                  {n.id}
                </text>
                {/* External label above the node (if distinct) */}
                {label !== n.id && (
                  <text x={p.x} y={p.y - radius - 1.2} textAnchor="middle" fontSize={2.4} fill={colors.text}>
                    {label}
                  </text>
                )}
                {/* Tentative distance below the node (if provided) */}
                {hasDist && (
                  <text x={p.x} y={p.y + radius + 2.2} textAnchor="middle" fontSize={2.2} fill={colors.distanceText}>
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
