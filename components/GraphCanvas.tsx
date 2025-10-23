'use client'

import React from 'react'
import type {Graph, GraphEdge} from '@/lib/graph/types'
import {GeometryLine, shortenLine, transformLineParallel} from "@/lib/geometry";

export interface GraphCanvasProps {
  graph: Graph | null
  width?: number | string
  height?: number | string
  onNodeClick?: (id: string) => void
}

// ViewBox dimensions (logical units)
const VB_W = 100
const VB_H = 60
const MARGIN = 6 // logical units padding around the edges

function edgePairs(edges: GraphEdge[]): Set<{p1: GraphEdge, p2: GraphEdge}> {
    const foundPairs = new Set<{p1: GraphEdge, p2: GraphEdge}>()
    edges.forEach(edge => {
        const reverseEdge = edges.find(e => e.from === edge.to && e.to === edge.from)
        if (reverseEdge && !foundPairs.has({p1: reverseEdge, p2: edge}) && !foundPairs.has({p1: edge, p2: reverseEdge})) {
            foundPairs.add({p1: edge, p2: reverseEdge})
        }
    })
    return foundPairs
}

export function GraphCanvas({ graph, width = '100%', height = 480, onNodeClick }: GraphCanvasProps) {
  // Early empty state
  if (!graph) {
    return (
      <div style={{ width, height }} className="w-full h-full flex items-center justify-center text-slate-600 border border-slate-200 rounded">
        Loading…
      </div>
    )
  }

  // Helpers
  const pos = (x: number, y: number) => ({
    x: MARGIN + x * (VB_W - 2 * MARGIN),
    y: MARGIN + y * (VB_H - 2 * MARGIN),
  })

  const radius = 3.2 // node circle radius in logical units
  const arrowPullback = 1.0 // extra gap to keep arrowheads out of node
  const strokeEdge = '#94a3b8' // slate-400
  const strokeEdgeActive = '#64748b' // slate-500
  const nodeFill = '#e0f2fe' // sky-100
  const nodeStroke = '#38bdf8' // sky-400
  const textColor = '#334155' // slate-700
  const arrowSizes = { width: 4, height: 4 }
  const arcStrokeWidth = 0.4

  const nodeIndex = new Map(graph.nodes.map(n => [n.id, n]))

  const isDirected = !!graph.metadata?.directed
  const isWeighted = !!graph.metadata?.weighted

  const bidirectionalEdges = edgePairs(graph.edges)

  return (
    <div style={{ width, height }} className="w-full h-full">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-full bg-white/50 border border-slate-200 rounded">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth={arrowSizes.width} markerHeight={arrowSizes.height} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeEdgeActive} />
          </marker>
        </defs>

        {/* Edges */}
        <g>
          {graph.edges.map((e, i) => {
            const from = nodeIndex.get(e.from)
            const to = nodeIndex.get(e.to)
            if (!from || !to) return null
            const p1 = pos(from.x, from.y)
            const p2 = pos(to.x, to.y)
            let arcLine: GeometryLine = {x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y}
            // Pull back both ends so lines do not intersect node circles
            const endGap = isDirected ? radius + arrowPullback : radius + 0.6
            arcLine = shortenLine(arcLine, radius + 0.6, endGap)

            // Adjust for bidirectional edges
            const offset = 1.3
            if (isDirected) {
                const pair1 = Array.from(bidirectionalEdges).find(p => (p.p1 === e))
                const pair2 = Array.from(bidirectionalEdges).find(p => (p.p2 === e))
                if (!!pair1) {
                    arcLine = transformLineParallel(arcLine, offset)
                } else if (!!pair2) {
                    arcLine = transformLineParallel(arcLine, -offset)
                }
            }
            const { x1, y1, x2, y2 } = arcLine
            const mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }

            return (
              <g key={`edge-${i}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeEdge}
                  strokeWidth={arcStrokeWidth}
                  markerEnd={isDirected ? 'url(#arrow)' : undefined}
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
                    <text x={0} y={1} textAnchor="middle" fontSize={3} fill={textColor} style={{ fontWeight: 500 }}>
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
            const p = pos(n.x, n.y)
            const label = n.label ?? n.id
            return (
              <g key={n.id} className="cursor-pointer" onClick={() => onNodeClick?.(n.id)}>
                <circle cx={p.x} cy={p.y} r={radius} fill={nodeFill} stroke={nodeStroke} strokeWidth={0.9} />
                {/* Node ID inside the circle */}
                <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={2.8} fill={textColor} style={{ fontWeight: 600 }}>
                  {n.id}
                </text>
                {/* External label above the node (if distinct) */}
                {label !== n.id && (
                  <text x={p.x} y={p.y - radius - 1} textAnchor="middle" fontSize={2.6} fill={textColor}>
                    {label}
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
