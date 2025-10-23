'use client'

import React from 'react'
import { Controls } from '@/components/Controls'
import { Legend } from '@/components/Legend'
import { QueuePanel } from '@/components/QueuePanel'
import { GraphCanvas } from '@/components/GraphCanvas'
import { GRAPH_SAMPLE_PATH, loadGraphFromUrl } from '@/lib/graph/loader'
import type {Graph, NodeId} from '@/lib/graph/types'
import { DijkstraStepper, type DijkstraState } from '@/lib/algorithms/dijkstra'

export default function GraphSimulator() {
  const [graph, setGraph] = React.useState<Graph | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [algorithm, setAlgorithm] = React.useState<'dijkstra'>('dijkstra')
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [speed, setSpeed] = React.useState(1)

  const [startId, setStartId] = React.useState<NodeId | undefined>(undefined)
  const [endId, setEndId] = React.useState<NodeId | undefined>(undefined)

  const stepperRef = React.useRef<DijkstraStepper | null>(null)
  const [state, setState] = React.useState<DijkstraState | null>(null)
  const timerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    setLoading(true)
    loadGraphFromUrl(GRAPH_SAMPLE_PATH)
      .then((g) => {
        setGraph(g)
        // default start/end: first and last nodes (if exist)
        const s = g.nodes[0]?.id
        const e = g.nodes[g.nodes.length - 1]?.id
        setStartId(s)
        setEndId(e)
        const stepper = new DijkstraStepper(g, s, e)
        stepperRef.current = stepper
        setState(stepper.getState())
      })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  // Recreate stepper when start/end change or graph changes
  React.useEffect(() => {
    if (!graph || !startId) return
    const stepper = new DijkstraStepper(graph, startId, endId)
    stepperRef.current = stepper
    setState(stepper.getState())
    setIsPlaying(false)
    // clear any running timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [graph, startId, endId])

  const doStep = React.useCallback(() => {
    if (!stepperRef.current) return
    const next = stepperRef.current.next()
    setState(next)
    if (next.done) {
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
    if (!graph || !startId) return
    const stepper = new DijkstraStepper(graph, startId, endId)
    stepperRef.current = stepper
    setState(stepper.getState())
    setIsPlaying(false)
  }, [graph, startId, endId])

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
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Shortest Path Visualizer</h1>

      <Controls
        algorithm={algorithm}
        onAlgorithmChange={(a) => setAlgorithm(a)}
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onStep={doStep}
        onReset={onReset}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="bg-white/70 border rounded-md p-2">
            {loading && <div className="p-6 text-slate-600">Loading graph…</div>}
            {error && <div className="p-6 text-red-600">{error}</div>}
            {!loading && !error && (
              <GraphCanvas
                graph={graph}
                height={520}
                onNodeClick={handleNodeClick}
                // highlight props
                highlightCurrent={state?.current}
                highlightVisited={state?.visited}
                highlightFrontier={state?.frontier}
                highlightPath={state?.path}
                highlightRelaxedEdges={state?.relaxedEdges}
                distances={state?.distances}
                startId={startId}
                endId={endId}
              />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-white/70 border rounded-md">
            <Legend />
          </div>
          <div className="bg-white/70 border rounded-md">
            <QueuePanel items={state?.frontier ?? []} />
          </div>
        </div>
      </div>
    </main>
  )
}
