"use client"
import ExampleGraphCard from "@/components/exampleGraphCard";
import React, {useEffect} from "react";
import {Graph} from "@/lib/graph/types";
import {loadGraphFromUrl} from "@/lib/graph/loader";

export interface ExampleGraphCardsProps {
    className: string;
}

// Memoized, module-scoped cache to avoid duplicate loads under React StrictMode (dev)
let EXAMPLE_GRAPHS_CACHE: Graph[] | null = null;
let EXAMPLE_GRAPHS_LOADING: Promise<Graph[]> | null = null;

async function loadAllExampleGraphs(): Promise<Graph[]> {
    const res = await fetch('/api/graphs', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to list graphs: ${res.status}`);
    const data = (await res.json()) as { files: string[] };
    const files = Array.isArray(data.files) ? data.files : [];
    const uniqueFiles = Array.from(new Set(files));
    if (uniqueFiles.length === 0) return [];

    const results = await Promise.allSettled(
        uniqueFiles.map(async (url) => ({ url, g: await loadGraphFromUrl(url) }))
    );

    const graphs: Graph[] = [];
    const seen = new Set<string>();
    for (const r of results) {
        if (r.status === 'fulfilled') {
            const { url, g } = r.value;
            if (!seen.has(url)) {
                seen.add(url);
                graphs.push(g);
            }
        }
    }
    return graphs;
}

function getExampleGraphsOnce(): Promise<Graph[]> {
    if (EXAMPLE_GRAPHS_CACHE) return Promise.resolve(EXAMPLE_GRAPHS_CACHE);
    if (EXAMPLE_GRAPHS_LOADING) return EXAMPLE_GRAPHS_LOADING;

    EXAMPLE_GRAPHS_LOADING = loadAllExampleGraphs()
        .then((gs) => {
            EXAMPLE_GRAPHS_CACHE = gs;
            EXAMPLE_GRAPHS_LOADING = null;
            return gs;
        })
        .catch((err) => {
            EXAMPLE_GRAPHS_LOADING = null;
            throw err;
        });

    return EXAMPLE_GRAPHS_LOADING;
}

const ExampleGraphCards = ({className = " "}: ExampleGraphCardsProps) => {
    const [exampleGraphs, setExampleGraphs] = React.useState<Graph[]>([])

    useEffect(() => {
        let cancelled = false;
        getExampleGraphsOnce()
            .then((gs) => { if (!cancelled) setExampleGraphs(gs); })
            .catch((err) => {
                console.warn('Unexpected error while loading examples:', err);
                if (!cancelled) setExampleGraphs([]);
            });
        return () => { cancelled = true; };
    }, [])

    return (
        <div className={className}>
            {exampleGraphs.map((g, i) => (
                <ExampleGraphCard
                    g={g}
                    key={g.metadata.name || (g.nodes?.map(n => n.id).join('|')) || i}
                />
            ))}
        </div>
    )
}

export default ExampleGraphCards;