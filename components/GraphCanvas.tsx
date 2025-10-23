'use client'

import React from 'react'
import type { Graph } from '@/lib/graph/types'

export interface GraphCanvasProps {
  graph: Graph | null
  width?: number | string
  height?: number | string
  onNodeClick?: (id: string) => void
}

export function GraphCanvas({ graph, width = '100%', height = 480, onNodeClick }: GraphCanvasProps) {
  // Placeholder SVG; real rendering will come later
  return (
    <div style={{ width, height }} className="w-full h-full flex items-center justify-center text-slate-800">
      <svg viewBox="0 0 100 60" className="w-full h-full border border-slate-200 rounded">
        {/* TODO: draw graph nodes/edges per SVG plan */}
        <text x="50" y="30" dominantBaseline="middle" textAnchor="middle" fontSize="4">
          GraphCanvas placeholder
        </text>
      </svg>
    </div>
  )
}

export default GraphCanvas

