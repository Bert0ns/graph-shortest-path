'use client'

import React from 'react'
import {
  VIEWBOX_W as VB_W,
  VIEWBOX_H as VB_H,
  VIEWBOX_MARGIN as MARGIN,
  GRID_MINOR_STEP,
  GRID_MAJOR_STEP,
  GRID_LABEL_FONT_SIZE,
  GRID_LABEL_OFFSET,
  GRID_COLOR_MINOR,
  GRID_COLOR_MAJOR,
  GRID_OPACITY_MINOR,
  GRID_OPACITY_MAJOR,
  GRID_LABEL_COLOR,
} from '@/lib/graph/graph_constants'

export const GraphGrid: React.FC = React.memo(() => {
  const innerW = VB_W - 2 * MARGIN
  const innerH = VB_H - 2 * MARGIN

  const lines: React.ReactNode[] = []
  const labels: React.ReactNode[] = []

  // helper to map normalized (0..1) to viewBox coords inside margins
  const mapX = (t: number) => MARGIN + t * innerW
  const mapY = (t: number) => MARGIN + t * innerH

  const pushVLine = (t: number, major: boolean) => {
    const x = mapX(t)
    lines.push(
      <line key={`gv-${t}`}
            x1={x} y1={MARGIN} x2={x} y2={VB_H - MARGIN}
            stroke={major ? GRID_COLOR_MAJOR : GRID_COLOR_MINOR}
            strokeWidth={major ? 0.25 : 0.2}
            opacity={major ? GRID_OPACITY_MAJOR : GRID_OPACITY_MINOR}
      />
    )
    if (major) {
      labels.push(
        <text key={`glx-${t}`} x={x} y={MARGIN - GRID_LABEL_OFFSET}
              textAnchor="middle" fontSize={GRID_LABEL_FONT_SIZE} fill={GRID_LABEL_COLOR}>
          {t.toFixed(2)}
        </text>
      )
    }
  }

  const pushHLine = (t: number, major: boolean) => {
    const y = mapY(t)
    lines.push(
      <line key={`gh-${t}`}
            x1={MARGIN} y1={y} x2={VB_W - MARGIN} y2={y}
            stroke={major ? GRID_COLOR_MAJOR : GRID_COLOR_MINOR}
            strokeWidth={major ? 0.25 : 0.2}
            opacity={major ? GRID_OPACITY_MAJOR : GRID_OPACITY_MINOR}
      />
    )
    if (major) {
      labels.push(
        <text key={`gly-${t}`} x={MARGIN - GRID_LABEL_OFFSET} y={y}
              textAnchor="end" dominantBaseline="middle"
              fontSize={GRID_LABEL_FONT_SIZE} fill={GRID_LABEL_COLOR}>
          {t.toFixed(2)}
        </text>
      )
    }
  }

  const eps = 1e-6
  for (let t = 0; t <= 1 + eps; t += GRID_MINOR_STEP) {
    const unit = t / GRID_MAJOR_STEP
    const isMajor = Math.abs(unit - Math.round(unit)) < 1e-6
    const clamped = Math.min(1, t)
    pushVLine(clamped, isMajor)
    pushHLine(clamped, isMajor)
  }

  return (
    <g aria-hidden="true">
      {lines}
      {labels}
    </g>
  )
})

GraphGrid.displayName = 'GraphGrid'

export default GraphGrid
