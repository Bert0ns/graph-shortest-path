'use client'

import React from 'react'
import GraphSimulator from '@/components/GraphSimulator'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { importGraphFromFile } from '@/lib/graph/loader'
import type { Graph } from '@/lib/graph/types'
import { toast } from 'sonner'

export default function Home() {
  const [importedGraph, setImportedGraph] = React.useState<Graph | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const onClickImport = React.useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFileChange = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { graph, errors } = await importGraphFromFile(file)
    if (errors.length) {
      toast.error('Failed to import graph', { description: errors.join('\n') })
      return
    }
    setImportedGraph(graph)
    toast.success('Graph imported', { description: graph.metadata.name || file.name })
    // Reset the input to allow re-importing the same file if desired
    e.target.value = ''
  }, [])

  return (
    <main className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-800">Shortest Path Visualizer</h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onFileChange}
          />
          <Button variant="default" onClick={onClickImport}>Import graph</Button>
          <Link href="/builder"><Button variant="outline">Open Graph Builder</Button></Link>
        </div>
      </div>
      <GraphSimulator importedGraph={importedGraph} />
    </main>
  )
}
