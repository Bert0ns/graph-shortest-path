import {Graph, GraphEdge, GraphNode} from "@/lib/graph/types";

type OSMNode = { type: 'node'; id: number; lat: number; lon: number }
type OSMWay = { type: 'way'; id: number; nodes: number[]; tags?: Record<string, string> }
type OSMElement = OSMNode | OSMWay
type OverpassResponse = { elements: OSMElement[] }

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const OVERPASS_QUERY = `
[out:json][timeout:25];
area[name="Modena"][boundary=administrative][admin_level~"^(7|8)$"]->.a;
(
  way["highway"](area.a);
);
(._;>;);
out body;
`

function parseOverpass(resp: OverpassResponse) {
    const nodes = new Map<number, OSMNode>()
    const ways: OSMWay[] = []
    for (const el of resp.elements) {
        if (el.type === 'node') nodes.set(el.id, el as OSMNode)
        else if (el.type === 'way') ways.push(el as OSMWay)
    }
    return { nodes, ways }
}

function computeBBox(nodes: Map<number, OSMNode>) {
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity
    for (const n of nodes.values()) {
        if (n.lat < minLat) minLat = n.lat
        if (n.lat > maxLat) maxLat = n.lat
        if (n.lon < minLon) minLon = n.lon
        if (n.lon > maxLon) maxLon = n.lon
    }
    const pad = 1e-9
    if (minLat === maxLat) { minLat -= pad; maxLat += pad }
    if (minLon === maxLon) { minLon -= pad; maxLon += pad }
    return { minLat, maxLat, minLon, maxLon }
}

// Normalize to [0,1] using a local equirectangular projection; inverted y (north on top)
function lonLatToNormalized(lon: number, lat: number, bbox: ReturnType<typeof computeBBox>) {
    const x = (lon - bbox.minLon) / (bbox.maxLon - bbox.minLon)
    const y = 1 - (lat - bbox.minLat) / (bbox.maxLat - bbox.minLat)
    return {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
    }
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000
    const toRad = (d: number) => (d * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(a))
}

async function fetchOverpass(query: string): Promise<OverpassResponse> {
    const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: 'data=' + encodeURIComponent(query),
    })
    if (!res.ok) throw new Error(`Overpass error: ${res.status}`)
    return (await res.json()) as OverpassResponse
}

export type BuildOptions = {
    // Limit highway types; default: major + residential
    allowedHighways?: string[]
    // Limit number of ways to reduce graph dimension
    maxWays?: number
}

/**
 * Builds an OSM graph of Modena matching the required schema.
 * Returns nodes with x, y normalized to [0,1] and weighted edges (meters).
 */
export default async function buildModenaGraph(options: BuildOptions = {}): Promise<Graph> {
    const defaultAllowed = [
        'motorway', 'trunk', 'primary', 'secondary', 'tertiary',
        'unclassified', 'residential', 'service'
    ]
    const allowed = new Set(options.allowedHighways ?? defaultAllowed)

    const data = await fetchOverpass(OVERPASS_QUERY)
    const { nodes: osmNodes, ways } = parseOverpass(data)
    const bbox = computeBBox(osmNodes)

    // Map OSM node id -> GraphNode
    const nodeMap = new Map<number, GraphNode>()
    // Limit the number of ways to reduce graph size
    const edgeMin = new Map<string, number>()

    let wayCount = 0
    for (const w of ways) {
        const hw = w.tags?.highway
        if (!hw || !allowed.has(hw)) continue
        if (options.maxWays && wayCount >= options.maxWays) break
        wayCount++

        // build consecutive nodes and arcs along the way
        for (let i = 0; i < w.nodes.length - 1; i++) {
            const aId = w.nodes[i]
            const bId = w.nodes[i + 1]
            const a = osmNodes.get(aId)
            const b = osmNodes.get(bId)
            if (!a || !b) continue

            // normalize nodes
            if (!nodeMap.has(a.id)) {
                const p = lonLatToNormalized(a.lon, a.lat, bbox)
                nodeMap.set(a.id, { id: `n${a.id}`, x: p.x, y: p.y })
            }
            if (!nodeMap.has(b.id)) {
                const p = lonLatToNormalized(b.lon, b.lat, bbox)
                nodeMap.set(b.id, { id: `n${b.id}`, x: p.x, y: p.y })
            }

            // meters
            const dist = haversineMeters(a.lat, a.lon, b.lat, b.lon)
            // Undirected key
            const u = `n${a.id}`
            const v = `n${b.id}`
            const key = u < v ? `${u}|${v}` : `${v}|${u}`
            const prev = edgeMin.get(key)
            if (prev === undefined || dist < prev) edgeMin.set(key, dist)
        }
    }

    const nodes: GraphNode[] = Array.from(nodeMap.values())

    const edges: GraphEdge[] = []
    for (const [key, weight] of edgeMin.entries()) {
        const [u, v] = key.split('|')
        edges.push({ from: u, to: v, weight })
    }

    return {
        metadata: {
            directed: false,
            weighted: true,
            name: 'Modena OSM (highways)',
            description: 'Road graph extracted from OpenStreetMap for the Modena area; normalized coordinates.',
        },
        nodes,
        edges,
    }
}
