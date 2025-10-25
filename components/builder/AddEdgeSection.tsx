'use client'

import React from 'react'
import type { GraphEdge, Graph } from '@/lib/graph/types'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export interface AddEdgeSectionProps {
  nodes: Graph['nodes']
  onCreateEdge: (edge: GraphEdge) => void
}

export function AddEdgeSection({ nodes, onCreateEdge }: AddEdgeSectionProps) {
  const [edgeForm, setEdgeForm] = React.useState({ from: '', to: '', weight: 1, label: '' })

  return (
    <section className="bg-white/70 border rounded-md p-3 space-y-2">
      <h2 className="text-sm font-semibold text-slate-700">Add Edge</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <Label htmlFor="efrom">From</Label>
          <select id="efrom" className="w-full border rounded px-2 py-1" value={edgeForm.from} onChange={(e) => setEdgeForm({ ...edgeForm, from: e.target.value })}>
            <option value="">Select…</option>
            {nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="eto">To</Label>
          <select id="eto" className="w-full border rounded px-2 py-1" value={edgeForm.to} onChange={(e) => setEdgeForm({ ...edgeForm, to: e.target.value })}>
            <option value="">Select…</option>
            {nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
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
          <Button onClick={() => {
              if (edgeForm.from.trim() === '' && edgeForm.to.trim() === '') {
                alert('Please select both From and To nodes.')
                return
              }
              if(edgeForm.from === edgeForm.to) {
                alert('From and To nodes cannot be the same.')
                return
              }
              onCreateEdge({ from: edgeForm.from, to: edgeForm.to, weight: edgeForm.weight, label: edgeForm.label || undefined });
              setEdgeForm({ from: '', to: '', weight: 1, label: '' })
          }}>Add Edge</Button>
        </div>
      </div>
    </section>
  )
}

export default AddEdgeSection

