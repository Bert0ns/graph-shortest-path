'use client'

import React from 'react'
import type { Graph } from '@/lib/graph/types'

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

  const radius = 2.8 // node circle radius in logical units
  const strokeEdge = '#94a3b8' // slate-400
  const strokeEdgeActive = '#64748b' // slate-500
  const nodeFill = '#e0f2fe' // sky-100
  const nodeStroke = '#38bdf8' // sky-400
  const textColor = '#334155' // slate-700

  const nodeIndex = new Map(graph.nodes.map(n => [n.id, n]))

  // Define arrow marker only if the graph is directed; safe to include always
  const isDirected = !!graph.metadata?.directed
  const isWeighted = !!graph.metadata?.weighted

  return (
    <div style={{ width, height }} className="w-full h-full">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-full bg-white/50 border border-slate-200 rounded">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeEdgeActive} />
          </marker>
          <filter id="label-bg" x="-0.05" y="-0.05" width="1.1" height="1.1">
            <feDropShadow dx="0" dy="0" stdDeviation="0.6" floodColor="#ffffff" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* Edges */}
        <g>
          {graph.edges.map((e, i) => {
            const from = nodeIndex.get(e.from)
            const to = nodeIndex.get(e.to)
            if (!from || !to) return null
            const p1 = pos(from.x, from.y)
            const p2 = pos(to.x, to.y)
            const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }

            return (
              <g key={`edge-${i}`}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={strokeEdge}
                  strokeWidth={0.7}
                  markerEnd={isDirected ? 'url(#arrow)' : undefined}
                />
                {isWeighted && (
                  <g transform={`translate(${mid.x}, ${mid.y})`}>
                    <rect x={-4} y={-3} width={8} height={6} rx={1.2} ry={1.2} fill="#ffffff" opacity={0.9} />
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
                <circle cx={p.x} cy={p.y} r={radius} fill={nodeFill} stroke={nodeStroke} strokeWidth={0.8} />
                <text x={p.x} y={p.y - radius - 0.8} textAnchor="middle" fontSize={2.8} fill={textColor}>
                  {label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export default GraphCanvas
