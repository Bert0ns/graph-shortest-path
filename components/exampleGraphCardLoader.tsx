import React, {useEffect} from "react";
import {Graph} from "@/lib/graph/types";
import ExampleGraphCard from "@/components/exampleGraphCard";
import {getGraphByUrlOnce, GRAPH_CACHE} from "@/lib/example_graphs_cache";

// Renders a single card that resolves independently
function ExampleGraphCardLoader({ url }: { url: string }) {
    const [graph, setGraph] = React.useState<Graph | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const t = window.setTimeout(() => setError(null), 0);
        // If already cached synchronously, set immediately to avoid flicker
        const cached = GRAPH_CACHE.get(url);
        let t2: number;
        let t3: number;
        if (cached) {
            t2 = window.setTimeout(() => setGraph(cached), 0);
        }
        else {
            t3 = window.setTimeout(() => setGraph(null), 0);
            getGraphByUrlOnce(url)
                .then((g) => {
                    if (!cancelled) setGraph(g);
                })
                .catch((e) => {
                    if (!cancelled) setError(e?.message ?? "Failed to load graph");
                });
        }

        return () => {
            cancelled = true;
            window.clearTimeout(t);
            window.clearTimeout(t2);
            window.clearTimeout(t3);
        };
    }, [url]);

    if (graph) {
        return <ExampleGraphCard g={graph} />;
    }

    if (error) {
        return (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Errore nel caricamento della card: {error}
                <div className="mt-2 text-xs text-red-600 break-all">{url}</div>
            </div>
        );
    }

    // Lightweight placeholder while the individual card is loading
    return (
        <div className="animate-pulse rounded-md border border-gray-200 bg-gray-50 p-6">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="mt-3 h-3 w-32 rounded bg-gray-200" />
            <div className="mt-6 h-24 w-full rounded bg-gray-200" />
        </div>
    );
}

export default ExampleGraphCardLoader;