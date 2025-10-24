'use client'

import React from 'react'
import type {Graph, GraphNode, GraphEdge, NodeId} from '@/lib/graph/types'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export interface BuilderSidebarProps {
  graph: Graph
  onCreateNode: (node: GraphNode) => void
  onCreateEdge: (edge: GraphEdge) => void
  onUpdateMetadata: (meta: Partial<Graph['metadata']>) => void
  onDeleteNode: (id: NodeId) => void
  onDeleteEdge: (key: GraphEdge) => void
}

export function BuilderSidebar({ graph, onCreateNode, onCreateEdge, onUpdateMetadata, onDeleteNode, onDeleteEdge }: BuilderSidebarProps) {
  // MVP skeleton: minimal forms, no validation yet. Values are controlled via local state.
  const [nodeForm, setNodeForm] = React.useState({ id: '', x: 0.2, y: 0.2, label: '' })
  const [edgeForm, setEdgeForm] = React.useState({ from: '', to: '', weight: 1, label: '' })

  return (
    <div className="space-y-4">
      <section className="bg-white/70 border rounded-md p-3 space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Metadata</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 col-span-2">
            <input id="directed" type="checkbox" checked={graph.metadata.directed} onChange={(e) => onUpdateMetadata({ directed: e.target.checked })} />
            <Label htmlFor="directed">Directed</Label>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <input id="weighted" type="checkbox" checked={graph.metadata.weighted} onChange={(e) => onUpdateMetadata({ weighted: e.target.checked })} />
            <Label htmlFor="weighted">Weighted</Label>
          </div>
          <div className="col-span-2">
            <Label htmlFor="name">Name</Label>
            <input id="name" className="w-full border rounded px-2 py-1" value={graph.metadata.name ?? ''} onChange={(e) => onUpdateMetadata({ name: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="desc">Description</Label>
            <textarea id="desc" className="w-full border rounded px-2 py-1" value={graph.metadata.description ?? ''} onChange={(e) => onUpdateMetadata({ description: e.target.value })} />
          </div>
        </div>
      </section>

      <section className="bg-white/70 border rounded-md p-3 space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Add Node</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="col-span-2">
            <Label htmlFor="nid">ID</Label>
            <input id="nid" className="w-full border rounded px-2 py-1" value={nodeForm.id} onChange={(e) => setNodeForm({ ...nodeForm, id: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="nx">x</Label>
            <input id="nx" type="number" min={0} max={1} step={0.01} className="w-full border rounded px-2 py-1" value={nodeForm.x} onChange={(e) => setNodeForm({ ...nodeForm, x: Number(e.target.value) })} />
          </div>
          <div>
            <Label htmlFor="ny">y</Label>
            <input id="ny" type="number" min={0} max={1} step={0.01} className="w-full border rounded px-2 py-1" value={nodeForm.y} onChange={(e) => setNodeForm({ ...nodeForm, y: Number(e.target.value) })} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="nlabel">Label (optional)</Label>
            <input id="nlabel" className="w-full border rounded px-2 py-1" value={nodeForm.label} onChange={(e) => setNodeForm({ ...nodeForm, label: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end">
            <Button onClick={() => { onCreateNode({ id: nodeForm.id, x: nodeForm.x, y: nodeForm.y, label: nodeForm.label || undefined }); setNodeForm({ id: '', x: 0.2, y: 0.2, label: '' }) }}>Add Node</Button>
          </div>
        </div>
      </section>

      <section className="bg-white/70 border rounded-md p-3 space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Add Edge</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <Label htmlFor="efrom">From</Label>
            <select id="efrom" className="w-full border rounded px-2 py-1" value={edgeForm.from} onChange={(e) => setEdgeForm({ ...edgeForm, from: e.target.value })}>
              <option value="">Select…</option>
              {graph.nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="eto">To</Label>
            <select id="eto" className="w-full border rounded px-2 py-1" value={edgeForm.to} onChange={(e) => setEdgeForm({ ...edgeForm, to: e.target.value })}>
              <option value="">Select…</option>
              {graph.nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="eweight">Weight</Label>
            <input id="eweight" type="number" step={0.1} className="w-full border rounded px-2 py-1" value={edgeForm.weight} onChange={(e) => setEdgeForm({ ...edgeForm, weight: Number(e.target.value) })} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="elabel">Label (optional)</Label>
            <input id="elabel" className="w-full border rounded px-2 py-1" value={edgeForm.label} onChange={(e) => setEdgeForm({ ...edgeForm, label: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end">
            <Button onClick={() => { onCreateEdge({ from: edgeForm.from, to: edgeForm.to, weight: edgeForm.weight, label: edgeForm.label || undefined }); setEdgeForm({ from: '', to: '', weight: 1, label: '' }) }}>Add Edge</Button>
          </div>
        </div>
      </section>

      <section className="bg-white/70 border rounded-md p-3 space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Lists</h2>
        <div className="space-y-2">
          <div>
            <h3 className="text-xs font-medium text-slate-600">Nodes</h3>
            <ul className="text-sm divide-y">
              {graph.nodes.map((n) => (
                <li key={n.id} className="flex items-center justify-between py-1">
                  <span className="truncate">{n.id}{n.label ? ` · ${n.label}` : ''}</span>
                  <Button variant="outline" size="sm" onClick={() => onDeleteNode(n.id)}>Delete</Button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-medium text-slate-600">Edges</h3>
            <ul className="text-sm divide-y">
              {graph.edges.map((e, idx) => (
                <li key={`${e.from}->${e.to}-${idx}`} className="flex items-center justify-between py-1">
                  <span className="truncate">{e.from} → {e.to} ({e.weight})</span>
                  <Button variant="outline" size="sm" onClick={() => onDeleteEdge({ from: e.from, to: e.to, weight: e.weight })}>Delete</Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BuilderSidebar

