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
  const px = (clientX - rect.left) / (rect.width || 1)
  const py = (clientY - rect.top) / (rect.height || 1)
  const vbX = px * VB_W
  const vbY = py * VB_H
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