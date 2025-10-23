
export type GeometryLine = {
    x1: number
    y1: number
    x2: number
    y2: number
}

export function shortenLine(
  line: GeometryLine,
  startOffset: number,
  endOffset: number
): GeometryLine {
  const { x1, y1, x2, y2 } = line
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  return {
    x1: x1 + ux * startOffset,
    y1: y1 + uy * startOffset,
    x2: x2 - ux * endOffset,
    y2: y2 - uy * endOffset,
  }
}

export function transformLineParallel(
    line: GeometryLine,
    offset: number
): GeometryLine {
    const { x1, y1, x2, y2 } = line
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len
    const uy = dy / len
    // Perpendicular unit vector
    const px = -uy
    const py = ux
    return {
        x1: x1 + px * offset,
        y1: y1 + py * offset,
        x2: x2 + px * offset,
        y2: y2 + py * offset,
    }
}