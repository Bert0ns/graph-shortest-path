import {
    VIEWBOX_H,
    VIEWBOX_MARGIN,
    VIEWBOX_W
} from '@/lib/graph/graph_constants'

export function clientToNormalizedFromSvg(
  svg: SVGSVGElement | null,
  clientX: number,
  clientY: number,
  VB_W: number,
  VB_H: number,
  MARGIN: number
) {
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()

  // Consider preserveAspectRatio (default: xMidYMid meet)
  const scale = Math.min((rect.width || 1) / VB_W, (rect.height || 1) / VB_H) || 1
  const innerW = scale * VB_W
  const innerH = scale * VB_H
  const offsetX = (rect.width - innerW) / 2
  const offsetY = (rect.height - innerH) / 2

  // Normalized position inside the inner drawing area [0,1]
  const px = (clientX - rect.left - offsetX) / (innerW || 1)
  const py = (clientY - rect.top - offsetY) / (innerH || 1)
  const pxClamped = Math.max(0, Math.min(1, px))
  const pyClamped = Math.max(0, Math.min(1, py))

  // Map to viewBox logical coords, then to normalized graph coords
  const vbX = pxClamped * VB_W
  const vbY = pyClamped * VB_H
  let nx = (vbX - MARGIN) / (VB_W - 2 * MARGIN)
  let ny = (vbY - MARGIN) / (VB_H - 2 * MARGIN)
  nx = Math.max(0, Math.min(1, nx))
  ny = Math.max(0, Math.min(1, ny))
  return { x: nx, y: ny }
}

//memoization cache
const _canvasCoordCache = new Map<string, { x: number; y: number }>()

export const convertToCanvasCoordinates = (x: number, y: number) => {
  const key = `${x},${y}`
  const cached = _canvasCoordCache.get(key)
  if (cached) return cached
  const result = {
    x: VIEWBOX_MARGIN + x * (VIEWBOX_W - 2 * VIEWBOX_MARGIN),
    y: VIEWBOX_MARGIN + y * (VIEWBOX_H - 2 * VIEWBOX_MARGIN),
  }
  _canvasCoordCache.set(key, result)
  return result
}