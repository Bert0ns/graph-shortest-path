'use client'

import React from 'react'
import type { NodeId } from '@/lib/graph/types'
import {
  NODE_RADIUS,
  START_RING_DELTA,
  START_RING_STROKE_WIDTH,
  END_RING_DELTA,
  END_RING_STROKE_WIDTH,
  END_RING_DASH,
  NODE_STROKE_WIDTH,
  NODE_ID_FONT_SIZE,
  LABEL_FONT_SIZE,
  LABEL_OFFSET,
  DISTANCE_FONT_SIZE,
  DISTANCE_OFFSET,
  colors,
} from '@/lib/graph/graph_constants'
import { convertToCanvasCoordinates } from '@/lib/graph/canvas_utils'

export interface GraphNodeItemProps {
  id: NodeId
  x: number // normalized
  y: number // normalized
  label?: string
  isCurrent?: boolean
  isVisited?: boolean
  inFrontier?: boolean
  inPath?: boolean
  startId?: NodeId
  endId?: NodeId
  distance?: number
  draggable?: boolean
  onClick?: () => void
  onDragStart?: (e: React.PointerEvent) => void
}

export const GraphNodeItem: React.FC<GraphNodeItemProps> = ({
  id,
  x,
  y,
  label,
  isCurrent,
  isVisited,
  inFrontier,
  inPath,
  startId,
  endId,
  distance,
  draggable,
  onClick,
  onDragStart,
}) => {
  const p = convertToCanvasCoordinates(x, y)
  let fill = colors.node.normal.fill
  let stroke = colors.node.normal.stroke
  if (inPath) { fill = colors.node.path.fill; stroke = colors.node.path.stroke }
  if (inFrontier) { fill = colors.node.frontier.fill; stroke = colors.node.frontier.stroke }
  if (isVisited) { fill = colors.node.visited.fill; stroke = colors.node.visited.stroke }
  if (isCurrent) { fill = colors.node.current.fill; stroke = colors.node.current.stroke }

  const hasDist = typeof distance === 'number' && isFinite(distance)
  const nodeHint = draggable ? `Drag to reposition node ${id}` : `Click to select ${id} as start/end`
  const cursor = draggable ? 'grab' : 'pointer'

  return (
    <g
      className="select-none touch-none"
      style={{ cursor }}
      onClick={onClick}
      onPointerDown={(e) => { if (draggable) { e.preventDefault(); onDragStart?.(e) } }}
    >
      <title>{nodeHint}</title>
      {startId === id && (
        <circle cx={p.x} cy={p.y} r={NODE_RADIUS + START_RING_DELTA} fill="none" stroke={colors.node.startRing} strokeWidth={START_RING_STROKE_WIDTH} />
      )}
      {endId === id && (
        <circle cx={p.x} cy={p.y} r={NODE_RADIUS + END_RING_DELTA} fill="none" stroke={colors.node.endRing} strokeWidth={END_RING_STROKE_WIDTH} strokeDasharray={END_RING_DASH} />
      )}

      <circle cx={p.x} cy={p.y} r={NODE_RADIUS} fill={fill} stroke={stroke} strokeWidth={NODE_STROKE_WIDTH} />

      <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={NODE_ID_FONT_SIZE} fill={colors.node.idText} style={{ fontWeight: 600 }}>
        {id}
      </text>
      {label && label !== id && (
        <text x={p.x} y={p.y - NODE_RADIUS - LABEL_OFFSET} textAnchor="middle" fontSize={LABEL_FONT_SIZE} fill={colors.node.labelText}>
          {label}
        </text>
      )}
      {hasDist && (
        <text x={p.x} y={p.y + NODE_RADIUS + DISTANCE_OFFSET} textAnchor="middle" fontSize={DISTANCE_FONT_SIZE} fill={colors.node.distanceText}>
          {distance}
        </text>
      )}
    </g>
  )
}

export default GraphNodeItem
