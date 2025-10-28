import { resolveGraph, validateGraphFile, downloadGraphAsJSON, importGraphFromFile, loadGraphFromUrl } from '@/lib/graph/loader'
import type { GraphFile, Graph } from '@/lib/graph/types'

describe('graph loader validation', () => {
  it('validates a correct graph file', () => {
    const file: GraphFile = {
      metadata: { directed: false, weighted: true, name: 'Sample' },
      nodes: [
        { id: 'A', x: 0.1, y: 0.2 },
        { id: 'B', x: 0.7, y: 0.4 },
        { id: 'C', x: 0.3, y: 0.8 },
      ],
      edges: [
        { from: 'A', to: 'B', weight: 2 },
        { from: 'B', to: 'C', weight: 3 },
      ],
    }
    const v = validateGraphFile(file)
    expect(v.ok).toBe(true)
    const g = resolveGraph(file)
    expect(g.nodes.length).toBe(3)
    expect(g.edges[0].weight).toBe(2)
    expect(g.edges[1].weight).toBe(3)
    expect(g.metadata.directed).toBe(false)
    expect(g.metadata.weighted).toBe(true)
    expect(g.metadata.name).toBe('Sample')
    expect<Graph>(g).toBeDefined()
    expect<Graph>(g).toBe(g)
  })

  it('preserves labels on nodes and edges when resolving', () => {
    const file: GraphFile = {
      metadata: { directed: true, weighted: true, name: 'Labeled' },
      nodes: [
        { id: 'A', x: 0.1, y: 0.2, label: 'Start' },
        { id: 'B', x: 0.7, y: 0.4, label: 'Mid' },
      ],
      edges: [
        { from: 'A', to: 'B', weight: 2, label: 'AB' },
      ],
    }
    const g = resolveGraph(file)
    expect(g.nodes[0].label).toBe('Start')
    expect(g.nodes[1].label).toBe('Mid')
    expect(g.edges[0].label).toBe('AB')
  })

  it('fails on duplicate node ids and invalid coords', () => {
    const bad: unknown = {
      metadata: { directed: true, weighted: true },
      nodes: [
        { id: 'A', x: -0.1, y: 0.2 },
        { id: 'A', x: 0.5, y: 1.2 },
      ],
      edges: [],
    }
    const v = validateGraphFile(bad)
    expect(v.ok).toBe(false)
    expect(v.errors.some(e => e.includes('duplicate node id'))).toBe(true)
    expect(v.errors.some(e => e.includes('coordinates must be in [0,1]'))).toBe(true)
  })

  it('rejects non-object file and missing metadata', () => {
    const v1 = validateGraphFile(null as unknown)
    expect(v1.ok).toBe(false)
    expect(v1.errors.some(e => e.includes('not an object'))).toBe(true)

    const v2 = validateGraphFile({ nodes: [], edges: [] })
    expect(v2.ok).toBe(false)
    expect(v2.errors.some(e => e.includes('Missing metadata'))).toBe(true)
  })

  it('requires boolean metadata.directed and metadata.weighted', () => {
    const v = validateGraphFile({
      metadata: { directed: 'yes', weighted: 1 } as unknown as GraphFile['metadata'],
      nodes: [{ id: 'A', x: 0.1, y: 0.1 }],
      edges: [],
    })
    expect(v.ok).toBe(false)
    expect(v.errors.some(e => e.includes('metadata.directed must be boolean'))).toBe(true)
    expect(v.errors.some(e => e.includes('metadata.weighted must be boolean'))).toBe(true)
  })

  it('requires nodes to be non-empty array and node objects with valid ids', () => {
    const v1 = validateGraphFile({
      metadata: { directed: true, weighted: true },
      nodes: [],
      edges: [],
    })
    expect(v1.ok).toBe(false)
    expect(v1.errors.some(e => e.includes('nodes must be a non-empty array'))).toBe(true)

    const v2 = validateGraphFile({
      metadata: { directed: true, weighted: true },
      nodes: [{} as never],
      edges: [],
    })
    expect(v2.ok).toBe(false)

    const v3 = validateGraphFile({
      metadata: { directed: true, weighted: true },
      nodes: [{ id: '', x: 0.1, y: 0.1 } as never],
      edges: [],
    })
    expect(v3.ok).toBe(false)
    expect(v3.errors.some(e => e.includes('node.id must be a non-empty string'))).toBe(true)
  })

  it('requires edges to be an array of valid objects', () => {
    const v1 = validateGraphFile({
      metadata: { directed: true, weighted: true },
      nodes: [{ id: 'A', x: 0.1, y: 0.1 }],
      edges: null as unknown as never[],
    })
    expect(v1.ok).toBe(false)
    expect(v1.errors.some(e => e.includes('edges must be an array'))).toBe(true)

    const v2 = validateGraphFile({
      metadata: { directed: true, weighted: true },
      nodes: [{ id: 'A', x: 0.1, y: 0.1 }],
      edges: [{} as never],
    })
    expect(v2.ok).toBe(false)
  })

  it('validates edge endpoints exist and weight is finite', () => {
    const v = validateGraphFile({
      metadata: { directed: true, weighted: true },
      nodes: [{ id: 'A', x: 0.1, y: 0.1 }],
      edges: [
        { from: 'A', to: 'B', weight: Number.NaN },
        { from: 'A', to: 'A', weight: Infinity },
      ],
    })
    expect(v.ok).toBe(false)
    expect(v.errors.some(e => e.includes('references unknown node'))).toBe(true)
    expect(v.errors.some(e => e.includes('weight must be a finite number'))).toBe(true)
  })
})


describe('downloadGraphAsJSON', () => {
  const originalCreateElement = document.createElement.bind(document)
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  afterEach(() => {
    document.createElement = originalCreateElement
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('creates a blob, anchor, and triggers download with expected filename', () => {
    const graph = resolveGraph({
      metadata: { directed: true, weighted: true, name: 'My Graph' },
      nodes: [{ id: 'A', x: 0.1, y: 0.1 }],
      edges: [],
    })

    let lastAnchor: HTMLAnchorElement | null = null
    document.createElement = jest.fn((tagName: string) => {
      const el = originalCreateElement(tagName)
      if (tagName.toLowerCase() === 'a') {
        lastAnchor = el as HTMLAnchorElement
        Object.defineProperty(el, 'click', { value: jest.fn(), configurable: true })
        Object.defineProperty(el, 'href', { value: '', writable: true })
        Object.defineProperty(el, 'download', { value: '', writable: true })
      }
      return el
    }) as unknown as typeof document.createElement

    URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = jest.fn()

    const res = downloadGraphAsJSON(graph)
    expect(res.success).toBe(true)
    expect(lastAnchor).not.toBeNull()
    expect(lastAnchor!.download).toBe('My Graph.json')
    expect(typeof lastAnchor!.href).toBe('string')
    expect((lastAnchor!.click as unknown as jest.Mock).mock.calls.length).toBe(1)
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalled()
  })
})


describe('importGraphFromFile', () => {
  it('imports a valid json file correctly', async () => {
    const fileData: GraphFile = {
      metadata: { directed: false, weighted: true, name: 'From File' },
      nodes: [ { id: 'A', x: 0.1, y: 0.1 } ],
      edges: [],
    }
    const stubFile = { text: async () => JSON.stringify(fileData) } as unknown as File
    const { graph, errors } = await importGraphFromFile(stubFile)
    expect(errors).toHaveLength(0)
    expect(graph.metadata.name).toBe('From File')
    expect(graph.nodes.length).toBe(1)
  })

  it('returns errors for invalid json', async () => {
    const stubFile = { text: async () => '{ invalid' } as unknown as File
    const { errors } = await importGraphFromFile(stubFile)
    expect(errors.length).toBeGreaterThan(0)
  })
})


describe('loadGraphFromUrl', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('loads and validates graph via fetch', async () => {
    const file: GraphFile = {
      metadata: { directed: true, weighted: true, name: 'From URL' },
      nodes: [{ id: 'A', x: 0.1, y: 0.1 }],
      edges: [],
    }
    ;global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => file })
    const g = await loadGraphFromUrl('/graphs/test.json')
    expect(g.metadata.name).toBe('From URL')
  })

  it('throws on non-OK response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 })
    await expect(loadGraphFromUrl('/missing.json')).rejects.toThrow('Failed to load graph: 404')
  })

  it('throws when validation fails', async () => {
    const bad = { metadata: { directed: true, weighted: true }, nodes: [], edges: [] }
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => bad })
    await expect(loadGraphFromUrl('/bad.json')).rejects.toThrow('Invalid graph file:')
  })
})
