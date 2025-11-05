import {Graph} from "@/lib/graph/types";
import {loadGraphFromUrl} from "@/lib/graph/loader";

// ---- Caching strategy ----
// We cache the list of example graph URLs once per session (module-scope)

let EXAMPLE_URLS_CACHE: string[] | null = null;
let EXAMPLE_URLS_LOADING: Promise<string[]> | null = null;

// Per-URL graph cache: resolve each card independently and dedupe concurrent loads
export const GRAPH_CACHE = new Map<string, Graph>();
export const GRAPH_PROMISES = new Map<string, Promise<Graph>>();

export async function getListExampleGraphUrls(): Promise<string[]> {
    const res = await fetch("/api/graphs", { cache: "no-store" });
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

export function getExampleUrlsOnce(): Promise<string[]> {
    if (EXAMPLE_URLS_CACHE) return Promise.resolve(EXAMPLE_URLS_CACHE);
    if (EXAMPLE_URLS_LOADING) return EXAMPLE_URLS_LOADING;

    EXAMPLE_URLS_LOADING = getListExampleGraphUrls()
        .then((urls) => {
            EXAMPLE_URLS_CACHE = urls;
            EXAMPLE_URLS_LOADING = null;
            return urls;
        })
        .catch((err) => {
            EXAMPLE_URLS_LOADING = null;
            throw err;
        });

    return EXAMPLE_URLS_LOADING;
}

export function getGraphByUrlOnce(url: string): Promise<Graph> {
    const cached = GRAPH_CACHE.get(url);
    if (cached) return Promise.resolve(cached);

    const inflight = GRAPH_PROMISES.get(url);
    if (inflight) return inflight;

    const p = loadGraphFromUrl(url)
        .then((g) => {
            GRAPH_CACHE.set(url, g);
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
