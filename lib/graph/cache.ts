import {validateGraphFile} from './loader'
import type {Graph} from './types'

export const GRAPH_CACHE_SCHEMA_VERSION = 1 as const
export const GRAPH_CACHE_KEY = `graph.current.v${GRAPH_CACHE_SCHEMA_VERSION}`

interface CachedPayloadV1 {
    schemaVersion: number
    updatedAt: string
    graph: Graph
}

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export function getCachedGraph(): Graph | null {
    if (!isBrowser()) return null
    try {
        const raw = window.localStorage.getItem(GRAPH_CACHE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as CachedPayloadV1
        if (parsed?.schemaVersion !== GRAPH_CACHE_SCHEMA_VERSION || !parsed.graph) {
            clearCachedGraph()
            console.log("Removed invalid graph cache due to schema version mismatch or missing graph")
            return null
        }
        const validation = validateGraphFile(parsed.graph as unknown)
        if (!validation.ok) {
            clearCachedGraph()
            console.log("Removed invalid graph cache due to validation failure:", validation.errors)
            return null
        }
        return parsed.graph
    } catch {
        console.log("Unable to use graph cache")
        return null
    }
}

export function setCachedGraph(graph: Graph): boolean {
    if (!isBrowser()) return false
    try {
        const payload: CachedPayloadV1 = {
            schemaVersion: GRAPH_CACHE_SCHEMA_VERSION,
            updatedAt: new Date().toISOString(),
            graph,
        }
        window.localStorage.setItem(GRAPH_CACHE_KEY, JSON.stringify(payload))
        return true
    } catch {
        return false
    }
}

export function clearCachedGraph(): void {
    if (!isBrowser()) return
    try {
        window.localStorage.removeItem(GRAPH_CACHE_KEY)
    } catch {
        // ignore
    }
}

