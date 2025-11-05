import {Graph} from "@/lib/graph/types";
import {loadGraphFromUrl} from "@/lib/graph/loader";
import {isBrowser} from "@/lib/utils";

// ---- Caching strategy ----
// We keep an in-memory cache for fast same-session reuse and persist into localStorage
// with TTL and a simple stale-while-revalidate strategy.

// Versioning for storage shape migrations
const STORAGE_VERSION = 1;
const STORAGE_PREFIX = `exampleGraphs:v${STORAGE_VERSION}`;

// TTLs (tunable)
const LIST_TTL_MS = 5 * 60 * 1000; // 5 minutes
const GRAPH_TTL_MS = 60 * 60 * 1000; // 1 hour

interface Cached<T> {
    data: T;
    ts: number
}

function listKey() {
    return `${STORAGE_PREFIX}:list`;
}

function graphKey(url: string) {
    return `${STORAGE_PREFIX}:graph:${encodeURIComponent(url)}`;
}

function safeGetItem(key: string): string | null {
    if (!isBrowser()) return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSetItem(key: string, value: string): void {
    if (!isBrowser()) return;
    try {
        window.localStorage.setItem(key, value);
    } catch { /* quota exceeded or disabled */
    }
}

function readCached<T>(key: string): { data: T | null, ts: number | null } {
    const raw = safeGetItem(key);
    if (!raw) return {data: null, ts: null};
    try {
        const parsed = JSON.parse(raw) as Cached<T>;
        if (typeof parsed !== 'object' || parsed === null) return {data: null, ts: null};
        if (!('data' in parsed) || !('ts' in parsed)) return {data: null, ts: null};
        return {data: parsed.data as T, ts: Number(parsed.ts) || 0};
    } catch {
        return {data: null, ts: null};
    }
}

function writeCached<T>(key: string, data: T): void {
    const payload: Cached<T> = {data, ts: Date.now()};
    safeSetItem(key, JSON.stringify(payload));
}

// We cache the list of example graph URLs once per session (module-scope)
let EXAMPLE_URLS_CACHE: string[] | null = null;
let EXAMPLE_URLS_LOADING: Promise<string[]> | null = null;

// Per-URL graph cache: resolve each fetch independently and dedupe concurrent loads
export const GRAPH_CACHE = new Map<string, Graph>();
export const GRAPH_PROMISES = new Map<string, Promise<Graph>>();

export async function getListExampleGraphUrls(): Promise<string[]> {
    const res = await fetch("/api/graphs", {cache: "no-store"});
    if (!res.ok) throw new Error(`Failed to list graphs: ${res.status}`);
    const data = (await res.json()) as { files: string[] };
    const files = Array.isArray(data.files) ? data.files : [];
    // Preserve order but ensure uniqueness
    const seen = new Set<string>();
    return files.filter((f) => {
        if (seen.has(f)) return false;
        seen.add(f);
        return true;
    });
}

function refreshUrlsInBackground() {
    // Don't override any foreground loading promise; just update cache/storage when ready
    getListExampleGraphUrls()
        .then((urls) => {
            EXAMPLE_URLS_CACHE = urls;
            writeCached<string[]>(listKey(), urls);
        })
        .catch(() => { /* silent background failure */
        });
}

export function getExampleUrlsOnce(): Promise<string[]> {
    if (EXAMPLE_URLS_CACHE) return Promise.resolve(EXAMPLE_URLS_CACHE);

    // Try browser cache first
    const {data, ts} = readCached<string[]>(listKey());
    if (data && Array.isArray(data)) {
        EXAMPLE_URLS_CACHE = data;
        const fresh = ts !== null && (Date.now() - ts) < LIST_TTL_MS;
        if (!fresh) refreshUrlsInBackground();
        return Promise.resolve(data);
    }

    if (EXAMPLE_URLS_LOADING) return EXAMPLE_URLS_LOADING;

    EXAMPLE_URLS_LOADING = getListExampleGraphUrls()
        .then((urls) => {
            EXAMPLE_URLS_CACHE = urls;
            EXAMPLE_URLS_LOADING = null;
            writeCached<string[]>(listKey(), urls);
            return urls;
        })
        .catch((err) => {
            EXAMPLE_URLS_LOADING = null;
            throw err;
        });

    return EXAMPLE_URLS_LOADING;
}

function refreshGraphInBackground(url: string) {
    // If already fetching, skip
    if (GRAPH_PROMISES.get(url)) return;
    const p = loadGraphFromUrl(url)
        .then((g) => {
            GRAPH_CACHE.set(url, g);
            writeCached<Graph>(graphKey(url), g);
            return g;
        })
        .finally(() => {
            GRAPH_PROMISES.delete(url);
        })
        .catch(() => { /* swallow background error */
            return GRAPH_CACHE.get(url)!;
        });
    GRAPH_PROMISES.set(url, p);
}

export function getGraphByUrlOnce(url: string): Promise<Graph> {
    const cached = GRAPH_CACHE.get(url);
    if (cached) return Promise.resolve(cached);

    // Try localStorage cache
    const {data, ts} = readCached<Graph>(graphKey(url));
    if (data) {
        GRAPH_CACHE.set(url, data);
        const fresh = ts !== null && (Date.now() - ts) < GRAPH_TTL_MS;
        if (!fresh) refreshGraphInBackground(url);
        return Promise.resolve(data);
    }

    const inflight = GRAPH_PROMISES.get(url);
    if (inflight) return inflight;

    const p = loadGraphFromUrl(url)
        .then((g) => {
            GRAPH_CACHE.set(url, g);
            writeCached<Graph>(graphKey(url), g);
            GRAPH_PROMISES.delete(url);
            return g;
        })
        .catch((e) => {
            // Don't keep a rejected promise in the map; allow retries on next renders
            GRAPH_PROMISES.delete(url);
            throw e;
        });

    GRAPH_PROMISES.set(url, p);
    return p;
}
