import { dijkstra } from './dijkstra'
import { Graph } from '../../graph/types'
import { TraceEvent } from '../../algorithms/types'

const makeGraph = (): Graph => ({
  metadata: { directed: true, weighted: true, name: 'T', description: '' },
  nodes: [
    { id: 'A', x: 0, y: 0 },
    { id: 'B', x: 0, y: 0 },
    { id: 'C', x: 0, y: 0 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 10 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'C', to: 'B', weight: 1 },
  ],
})

describe('dijkstra', () => {
  it('finds shortest path and distances', () => {
    const g = makeGraph()
    const trace: TraceEvent[] = []
    const result = dijkstra(g, 'A', 'B', (e) => trace.push(e))

    expect(result.path).toEqual(['A', 'C', 'B'])
    expect(result.distances['B']).toBe(3)
    expect(trace.some((e) => e.type === 'finish')).toBe(true)
  })

  it('returns path with just start when start === end', () => {
    const g = makeGraph()
    const result = dijkstra(g, 'A', 'A', () => {})
    expect(result.path).toEqual(['A'])
    expect(result.distances['A']).toBe(0)
  })
})

