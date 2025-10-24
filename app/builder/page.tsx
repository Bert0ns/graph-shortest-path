'use client'

import React from 'react'
import {GraphCanvas} from '@/components/GraphCanvas'
import type {Graph, GraphEdge, GraphNode} from '@/lib/graph/types'
import {BuilderSidebar} from '@/components/builder/BuilderSidebar'
import {isEdgeAutoLoop, isEdgeDuplicate, isNodeDuplicate} from "@/lib/graph/graph_functions";
import BuilderTopbar from "@/components/builder/BuilderTopBar";


export default function GraphBuilderPage() {
    const [graph, setGraph] = React.useState<Graph>({
        metadata: {directed: true, weighted: true, name: 'Untitled', description: ''},
        nodes: [],
        edges: [],
    })

    const handleCreateNode = React.useCallback((node: GraphNode) => {
        if(!isNodeDuplicate(graph, node)) {
            setGraph((g) => ({...g, nodes: [...g.nodes, node]}))
        }
    }, [graph])

    const handleCreateEdge = React.useCallback((edge: GraphEdge) => {
        if (!isEdgeDuplicate(graph, edge) && !isEdgeAutoLoop(edge)) {
            setGraph((g) => ({...g, edges: [...g.edges, edge]}))
        }
    }, [graph])

    const handleUpdateMetadata = React.useCallback((meta: Partial<Graph['metadata']>) => {
        setGraph((g) => ({...g, metadata: {...g.metadata, ...meta}}))
    }, [])

    const handleDeleteNode = React.useCallback((id: string) => {
        setGraph((g) => ({
            ...g,
            nodes: g.nodes.filter((n) => n.id !== id),
            edges: g.edges.filter((e) => e.from !== id && e.to !== id),
        }))
    }, [])

    const handleDeleteEdge = React.useCallback((edge: GraphEdge) => {
        setGraph((g) => ({
            ...g,
            edges: g.edges.filter((e) => !(e.from === edge.from && e.to === edge.to && (edge.weight == null || edge.weight === e.weight))),
        }))
    }, [])

    return (
        <main className="container mx-auto p-4 space-y-4">
            <header className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-slate-800">Graph Builder</h1>
                <div className="text-sm text-slate-600">MVP skeleton</div>
            </header>

            <div>
                <BuilderTopbar
                    graph={graph}
                    onCreateNode={handleCreateNode}
                    onCreateEdge={handleCreateEdge}
                    onUpdateMetadata={handleUpdateMetadata}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <section className="md:col-span-3 bg-white/70 border rounded-md p-2">
                    <GraphCanvas graph={graph} height={560}/>
                </section>

                <aside className="md:col-span-1">
                    <BuilderSidebar
                        graph={graph}
                        onDeleteNode={handleDeleteNode}
                        onDeleteEdge={handleDeleteEdge}
                    />
                </aside>
            </div>
        </main>
    )
}
