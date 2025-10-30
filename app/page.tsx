"use client"
import Link from 'next/link'
import {websiteConfigs} from '@/website.configs'
import {setCachedGraph} from "@/lib/graph/cache";
import {Graph} from "@/lib/graph/types";
import React, {useEffect} from "react";
import {loadGraphFromUrl} from "@/lib/graph/loader";


export default function HomeLanding() {
    const [exampleGraphs, setExampleGraphs] = React.useState<Graph[]>([])

    useEffect(() => {
        const examples = [
                '/graphs/triangle-unweighted.json',
                '/graphs/square-weighted-directed.json',
                '/graphs/grid-6-nodes.json',
                '/graphs/tree-7-nodes.json',
            ];

        (async () => {
            try {
                const results = await Promise.allSettled(examples.map(loadGraphFromUrl))

                setExampleGraphs(
                    results.flatMap((r, idx) => {
                        if (r.status === 'fulfilled') return [r.value]
                        console.warn(`Failed to load example graph from ${examples[idx]}: ${r.reason}`)
                        return []
                    })
                )
            } catch (err) {
                console.warn('Unexpected error while loading examples:', err)
            }
        })()
    }, [])


    return (
        <main className="container mx-auto p-6 space-y-10 max-w-4xl">
            <section className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{websiteConfigs.title}</h1>
                <p className="text-muted-foreground max-w-3xl">
                    {websiteConfigs.description} This app helps you understand shortest‑path algorithms through a
                    clean, step‑by‑step visualization.
                </p>
                <p className="text-muted-foreground max-w-3xl">
                    What you can do here: build or import graphs, pick a start and end node, and watch the
                    algorithm discover the shortest path. Use the Builder to create your own graphs or tweak
                    coordinates and edges.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link href="/simulator"
                          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90">
                        Open Simulator
                    </Link>
                    <Link href="/builder"
                          className="inline-flex items-center px-4 py-2 rounded-md border border-border hover:bg-accent">
                        Open Builder
                    </Link>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Try it with example graphs</h2>
                <p className="text-muted-foreground">Pick an example to jump into the simulator already loaded with that
                    graph.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                    {exampleGraphs.map((g, i) => {
                        const meta = g.metadata.weighted ? (g.metadata.directed ? "Weighted • Directed" : "Weighted • Undirected") : (g.metadata.directed ? "Unweighted • Directed" : "Unweighted • Undirected")
                        const key = g.metadata.name?.trim() || `${g.nodes.length}-${g.edges.length}-${i}`

                        return (
                            <Link key={key} href={websiteConfigs.menuItems[1].link}
                                  onClick={() => setCachedGraph(g)}
                                  className="group block rounded-md border border-border p-4 hover:border-primary transition-colors bg-card/70">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-medium text-foreground group-hover:text-primary">{g.metadata.name}</h3>
                                    <span className="text-xs text-foreground/60 whitespace-nowrap">{meta}</span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{g.metadata.description}</p>
                            </Link>
                        )
                    })}
                </div>
            </section>
        </main>
    )
}
