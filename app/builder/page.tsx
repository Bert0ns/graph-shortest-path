'use client'

import React from 'react'
import {GraphCanvas} from '@/components/GraphCanvas/GraphCanvas'
import type {Graph, GraphEdge, GraphNode} from '@/lib/graph/types'
import {BuilderSidebar} from '@/components/builder/BuilderSidebar'
import {isEdgeAutoLoop, isEdgeDuplicate, isNodeDuplicate} from "@/lib/graph/graph_functions";
import BuilderTopbar from "@/components/builder/BuilderTopBar";
import {Button} from '@/components/ui/button'
import {downloadGraphAsJSON, importGraphFromFile} from '@/lib/graph/loader'
import { toast } from 'sonner'
import Link from 'next/link'
import { clearCachedGraph, getCachedGraph, setCachedGraph } from '@/lib/graph/cache'

export default function GraphBuilderPage() {
    const [graph, setGraph] = React.useState<Graph>({
        metadata: {directed: true, weighted: true, name: 'Untitled', description: ''},
        nodes: [],
        edges: [],
    })
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)

    // Load from cache on mount
    React.useEffect(() => {
        const g = getCachedGraph()
        if (g) {
            setGraph(g)
            toast.info('Loaded graph from cache', { description: g.metadata.name || 'Current graph' })
        }
    }, [])

    // Debounce save to cache on graph changes
    React.useEffect(() => {
        const id = window.setTimeout(() => {
            setCachedGraph(graph)
        }, 300)
        return () => window.clearTimeout(id)
    }, [graph])

    const handleCreateNode = React.useCallback((node: GraphNode) => {
        if (!isNodeDuplicate(graph, node)) {
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

    const handleExport = React.useCallback(() => {
        const {success, errors} = downloadGraphAsJSON(graph)
        if (!success) {
            toast(`Export failed:\n- ${errors.join('\n- ')}`)
        } else {
            toast.success('Exported graph')
        }
    }, [graph])

    const handleImportClick = React.useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleImportFile: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(async (e) => {
        const {graph, errors} = await importGraphFromFile(e.target.files?.[0])
        if (e.target) e.target.value = ''
        if (errors.length > 0) {
            toast(`Import failed:\n- ${errors.join('\n- ')}`)
            return
        }
        setGraph(graph)
        setCachedGraph(graph)
        toast.success('Imported graph', { description: graph.metadata.name })
    }, [])

    const handleClear = React.useCallback(() => {
        clearCachedGraph()
        setGraph({ metadata: { directed: true, weighted: true, name: 'Untitled', description: '' }, nodes: [], edges: [] })
        toast.info('Cleared cached graph', { description: 'Start from scratch' })
    }, [])

    return (
        <main className="container mx-auto p-4 space-y-4">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/"><Button variant="outline" title="Back to the main visualizer">Back to Home</Button></Link>
                    <h1 className="text-lg sm:text-xl font-semibold text-slate-800" title="Graph Builder — create nodes and edges, drag nodes to reposition">Graph Builder</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json,.json"
                        className="hidden"
                        onChange={handleImportFile}
                    />
                    <Button variant="ghost" onClick={handleClear} title="Clear the current graph and cache">Clear graph</Button>
                    <Button variant="outline" onClick={handleImportClick} title="Import a graph JSON file to edit">Import JSON</Button>
                    <Button onClick={handleExport} title="Export the current graph as JSON">Export JSON</Button>
                </div>
            </header>

            <div>
                <BuilderTopbar
                    graph={graph}
                    onCreateNode={handleCreateNode}
                    onCreateEdge={handleCreateEdge}
                    onUpdateMetadata={handleUpdateMetadata}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <section className="lg:col-span-3 bg-white/70 border rounded-md p-2" title="Canvas — drag nodes to reposition; edges update automatically">
                    <GraphCanvas
                        graph={graph}
                        height={"clamp(320px, 50vh, 640px)"}
                        showGrid
                        draggableNodes
                        visualizationState={null}
                        onNodePositionChange={(id, x, y) => {
                            setGraph((g) => ({
                                ...g,
                                nodes: g.nodes.map((n) => n.id === id ? { ...n, x, y } : n),
                            }))
                        }}
                    />
                </section>

                <aside className="lg:col-span-1">
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
