import React, {useEffect} from "react";
import {Graph} from "@/lib/graph/types";
import ExampleGraphCard from "@/components/exampleGraphCard";
import {getGraphByUrlOnce, GRAPH_CACHE} from "@/lib/example_graphs_cache";
import ExampleGraphCardSkeleton from "@/components/ExampleGraphCardSkeleton";

// Renders a single card that resolves independently
function ExampleGraphCardLoader({ url }: { url: string }) {
    const [graph, setGraph] = React.useState<Graph | null>(() => GRAPH_CACHE.get(url) ?? null);
    const [error, setError] = React.useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        getGraphByUrlOnce(url)
            .then((g) => {
                if (!cancelled) setGraph(g);
            })
            .catch((e) => {
                if (!cancelled) setError(e?.message ?? "Failed to load graph");
            });
        return () => { cancelled = true; };
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

    // Render a skeleton that matches the card layout exactly
    return <ExampleGraphCardSkeleton />;
}

export default ExampleGraphCardLoader;
