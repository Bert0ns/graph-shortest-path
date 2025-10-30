'use client'

import React from 'react'
import { Controls, AlgorithmKey } from '@/components/Controls'
import { Legend } from '@/components/Legend'
import { QueuePanel } from '@/components/QueuePanel'
import { GraphCanvas } from '@/components/GraphCanvas/GraphCanvas'
import { GRAPH_SAMPLE_PATH, loadGraphFromUrl } from '@/lib/graph/loader'
import type { Graph, NodeId } from '@/lib/graph/types'
import { getCachedGraph, setCachedGraph } from "@/lib/graph/cache";
import { dijkstra } from "@/lib/algorithms/core/dijkstra";
import { traceAlgorithm } from "@/lib/algorithms/visualization/tracer";
import { TraceStepper, VisualizationState } from "@/lib/algorithms/visualization/TraceStepper";
import { PathfindingAlgorithm } from "@/lib/algorithms/types";
import { useSearchParams } from 'next/navigation'

const ALGORITHMS: Record<string, PathfindingAlgorithm> = {
    dijkstra,
};

const ALGORITHM_NAMES: Record<AlgorithmKey, string> = {
    dijkstra: 'Dijkstra',
};

interface GraphSimulatorProps {
    // If provided, the simulator renders this graph instead of loading the sample.
    importedGraph?: Graph | null
}

export default function GraphSimulator({ importedGraph = null }: GraphSimulatorProps) {
    const [graph, setGraph] = React.useState<Graph | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const [algorithm, setAlgorithm] = React.useState<AlgorithmKey>('dijkstra')
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [speed, setSpeed] = React.useState(1)

    const [startId, setStartId] = React.useState<NodeId | undefined>(undefined)
    const [endId, setEndId] = React.useState<NodeId | undefined>(undefined)

    const stepperRef = React.useRef<TraceStepper | null>(null)
    const [state, setState] = React.useState<VisualizationState | null>(null)
    const timerRef = React.useRef<number | null>(null)

    const searchParams = useSearchParams()

    const initializeFromGraph = React.useCallback((g: Graph) => {
        setGraph(g)
        const s = g.nodes[0]?.id
        const e = g.nodes[g.nodes.length - 1]?.id
        setStartId(s)
        setEndId(e)

        if (!s || !e) return;

        const algo = ALGORITHMS[algorithm];
        if (!algo) return;

        const traceLog = traceAlgorithm(algo, g, s, e)
        const stepper = new TraceStepper(traceLog)
        stepperRef.current = stepper
        setState(stepper.state)
    }, [algorithm])

    // Initial load: priority is (1) ?graph URL, (2) importedGraph prop, (3) cached, (4) sample file
    React.useEffect(() => {
        const urlParam = searchParams?.get('graph')
        if (urlParam) {
            setLoading(true)
            loadGraphFromUrl(urlParam)
                .then((g) => {
                    initializeFromGraph(g)
                    setCachedGraph(g)
                })
                .catch((e: unknown) => setError(String(e)))
                .finally(() => setLoading(false))
            return
        }

        if (importedGraph) {
            initializeFromGraph(importedGraph)
            return
        }
        const g = getCachedGraph()
        if (g) {
            initializeFromGraph(g)
            return
        }
        // Load sample graph if nothing else is provided
        setLoading(true)
        loadGraphFromUrl(GRAPH_SAMPLE_PATH)
            .then((g) => {
                initializeFromGraph(g)
                setCachedGraph(g)
            })
            .catch((e: unknown) => setError(String(e)))
            .finally(() => {
                setLoading(false)
            })
    }, [importedGraph, initializeFromGraph, searchParams])

    // If the parent provides/replaces an imported graph later, re-init from it
    React.useEffect(() => {
        if (!importedGraph) return
        initializeFromGraph(importedGraph)
        setIsPlaying(false)
        if (timerRef.current) {
            window.clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [importedGraph, initializeFromGraph])

    // Recreate stepper when start/end change or graph changes
    React.useEffect(() => {
        if (!graph || !startId || !endId) return

        const algo = ALGORITHMS[algorithm];
        if (!algo) return;

        const traceLog = traceAlgorithm(algo, graph, startId, endId)
        const stepper = new TraceStepper(traceLog)
        stepperRef.current = stepper
        setState(stepper.state)
        setIsPlaying(false)
        // clear any running timer
        if (timerRef.current) {
            window.clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [graph, startId, endId, algorithm])

    const doStep = React.useCallback(() => {
        if (!stepperRef.current) return;
        stepperRef.current.next()
        setState({ ...stepperRef.current.state })
        if (stepperRef.current.state.done) {
            setIsPlaying(false)
        }
    }, [])

    // Manage interval based on isPlaying and speed
    React.useEffect(() => {
        if (!isPlaying) {
            if (timerRef.current) {
                window.clearInterval(timerRef.current)
                timerRef.current = null
            }
            return
        }
        const baseMs = 1000
        const interval = Math.max(50, Math.floor(baseMs / (speed || 1)))

        if (timerRef.current) {
            window.clearInterval(timerRef.current)
            timerRef.current = null
        }

        timerRef.current = window.setInterval(() => {
            doStep()
        }, interval)

        return () => {
            if (timerRef.current) {
                window.clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [isPlaying, speed, doStep])

    const onPlay = React.useCallback(() => {
        setIsPlaying(true)
    }, [])

    const onPause = React.useCallback(() => {
        setIsPlaying(false)
    }, [])

    const onReset = React.useCallback(() => {
        if (!stepperRef.current) return;
        stepperRef.current.reset()
        setState({ ...stepperRef.current.state })
        setIsPlaying(false)
    }, [])

    const handleNodeClick = React.useCallback((id: string) => {
        // Selection logic: pick start then end; clicking a third time resets start
        if (!startId || startId === id) {
            setStartId(id)
            setEndId(undefined)
        } else if (!endId) {
            setEndId(id)
        } else {
            setStartId(id)
            setEndId(undefined)
        }
    }, [startId, endId])

    return (
        <main className="container mx-auto mt-4 space-y-4">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Simulator</h1>

            <Controls
                algorithm={algorithm}
                onAlgorithmChange={(a) => setAlgorithm(a)}
                availableAlgorithms={ALGORITHM_NAMES}
                isPlaying={isPlaying}
                onPlay={onPlay}
                onPause={onPause}
                onStep={doStep}
                onReset={onReset}
                speed={speed}
                onSpeedChange={setSpeed}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    <div className="bg-card/70 border rounded-md p-2">
                        {loading && <div className="p-6 text-muted-foreground">Loading graph…</div>}
                        {error && <div className="p-6 text-destructive">{error}</div>}
                        {!loading && !error && (
                            <GraphCanvas
                                graph={graph}
                                height={"clamp(320px, 50vh, 640px)"}
                                onNodeClick={handleNodeClick}
                                visualizationState={state}
                                startId={startId}
                                endId={endId}
                            />
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="bg-card/70 border rounded-md">
                        <Legend />
                    </div>
                    <div className="bg-card/70 border rounded-md">
                        <QueuePanel items={state?.frontier ?? []} />
                    </div>
                </div>
            </div>
        </main>
    )
}
