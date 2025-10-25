import type {Graph, GraphEdge, GraphFile} from "./types";


export function validateGraphFile(file: unknown): { ok: boolean, errors: string[] } {
    const errors: string[] = []
    if (!file || typeof file !== 'object') {
        errors.push('File is not an object')
        return {ok: false, errors}
    }

    const f = file as Record<string, unknown>

    // metadata
    if (!('metadata' in f) || !f.metadata || typeof f.metadata !== 'object') {
        errors.push('Missing metadata')
    } else {
        const meta = f.metadata as Record<string, unknown>
        if (typeof meta.directed !== 'boolean') errors.push('metadata.directed must be boolean')
        if (typeof meta.weighted !== 'boolean') errors.push('metadata.weighted must be boolean')
    }

    // nodes
    if (!Array.isArray(f.nodes) || f.nodes.length === 0) errors.push('nodes must be a non-empty array')

    const ids = new Set<string>()
    for (const n of (f.nodes ?? []) as unknown[]) {
        if (!n || typeof n !== 'object') {
            errors.push('node must be an object')
            continue
        }
        const node = n as Record<string, unknown>
        const id = typeof node.id === 'string' ? node.id : ''
        if (!id.trim()) errors.push('node.id must be a non-empty string')
        if (id && ids.has(id)) errors.push(`duplicate node id: ${id}`)
        if (id) ids.add(id)
        const in01 = (v: unknown) => typeof v === 'number' && v >= 0 && v <= 1
        if (!in01(node.x) || !in01(node.y)) errors.push(`node ${id || '<unknown>'} coordinates must be in [0,1]`)
    }

    // edges
    if (!Array.isArray(f.edges)) errors.push('edges must be an array')
    for (const e of (f.edges ?? []) as unknown[]) {
        if (!e || typeof e !== 'object') {
            errors.push('edge must be an object')
            continue
        }
        const edge = e as Record<string, unknown>
        const from = typeof edge.from === 'string' ? edge.from : ''
        const to = typeof edge.to === 'string' ? edge.to : ''
        if (!ids.has(from)) errors.push(`edge.from references unknown node: ${from}`)
        if (!ids.has(to)) errors.push(`edge.to references unknown node: ${to}`)
        if (typeof edge.weight !== 'number' || !isFinite(edge.weight as number)) errors.push(`edge weight must be a finite number for ${from}->${to}`)
    }

    return {ok: errors.length === 0, errors}
}

// Resolve file format into runtime Graph structure
export function resolveGraph(file: GraphFile): Graph {
    return {
        metadata: file.metadata,
        nodes: file.nodes,
        edges: file.edges.map((e: GraphEdge) => ({
            from: e.from,
            to: e.to,
            weight: e.weight,
            label: e.label,
        })),
    };
}

// Convenience default sample path from public/graphs
export const GRAPH_SAMPLE_PATH = "/graphs/sample.json";

// Fetch and construct a Graph from a URL (client-side)
export async function loadGraphFromUrl(url: string): Promise<Graph> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load graph: ${res.status}`);
    const json = (await res.json()) as GraphFile;
    const validation = validateGraphFile(json)
    if (!validation.ok) {
        throw new Error(`Invalid graph file:\n- ${validation.errors.join('\n- ')}`)
    }
    return resolveGraph(json);
}

export function downloadGraphAsJSON(graph: Graph): { success: boolean, errors: string[] } {
    const errors: string[] = []
    try {
        const blob = new Blob([JSON.stringify(graph, null, 2)], {type: 'application/json'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${graph.metadata.name?.trim() || 'graph'}.json`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    } catch (e) {
        errors.push(String(e))
    }

    return {success: errors.length === 0, errors}
}

export async function importGraphFromFile(file: File | undefined): Promise<{ graph: Graph, errors: string[] }> {
    const errors: string[] = []
    let graph: Graph = {
        metadata: {directed: false, weighted: false, name: 'failed', description: ''},
        nodes: [],
        edges: [],
    }

    if (file === undefined) {
        return {graph, errors: ["No file selected"]}
    }

    try {
        const text = await file.text()
        const json = JSON.parse(text) as unknown
        const validation = validateGraphFile(json)
        if (!validation.ok) {
            errors.push("Graph file is not formatted correctly")
        } else {
            graph = resolveGraph(json as GraphFile)
        }
    } catch (err) {
        errors.push(String(err))
    }

    return {graph, errors}
}
