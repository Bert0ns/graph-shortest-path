'use client'

import React from 'react'
import { Controls } from '@/components/Controls'
import { Legend } from '@/components/Legend'
import { QueuePanel } from '@/components/QueuePanel'
import { GraphCanvas } from '@/components/GraphCanvas'
import { GRAPH_SAMPLE_PATH, loadGraphFromUrl } from '@/lib/graph/loader'
import type { Graph } from '@/lib/graph/types'

export default function GraphSimulator() {
  const [graph, setGraph] = React.useState<Graph | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [algorithm, setAlgorithm] = React.useState<'dijkstra'>('dijkstra')
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [speed, setSpeed] = React.useState(1)

  React.useEffect(() => {
    setLoading(true)
    loadGraphFromUrl(GRAPH_SAMPLE_PATH)
      .then(setGraph)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Shortest Path Visualizer</h1>

      <Controls
        algorithm={algorithm}
        onAlgorithmChange={(a) => setAlgorithm(a)}
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onStep={() => { /* TODO: step Dijkstra */ }}
        onReset={() => { /* TODO: reset state */ setIsPlaying(false) }}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="bg-white/70 border rounded-md p-2">
            {loading && <div className="p-6 text-slate-600">Loading graph…</div>}
            {error && <div className="p-6 text-red-600">{error}</div>}
            {!loading && !error && (
              <GraphCanvas graph={graph} height={520} />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-white/70 border rounded-md">
            <Legend />
          </div>
          <div className="bg-white/70 border rounded-md">
            <QueuePanel items={[]} />
          </div>
        </div>
      </div>
    </main>
  )
}
