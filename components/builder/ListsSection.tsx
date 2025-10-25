'use client'

import React from 'react'
import type { Graph, GraphEdge, NodeId } from '@/lib/graph/types'
import { Button } from '@/components/ui/button'

export interface ListsSectionProps {
  nodes: Graph['nodes']
  edges: Graph['edges']
  onDeleteNode: (id: NodeId) => void
  onDeleteEdge: (edge: GraphEdge) => void
}

export function ListsSection({ nodes, edges, onDeleteNode, onDeleteEdge }: ListsSectionProps) {
  return (
    <section className="bg-white/70 border rounded-md p-3 space-y-2">
      <h2 className="text-sm font-semibold text-slate-700">Lists</h2>
      <div className="space-y-2">
        <div>
          <h3 className="text-xs font-medium text-slate-600">Nodes</h3>
          <ul className="text-sm divide-y">
            {nodes.map((n) => (
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
            {edges.map((e, idx) => (
              <li key={`${e.from}->${e.to}-${idx}`} className="flex items-center justify-between py-1">
                <span className="truncate">{e.from} → {e.to}, w:{e.weight}</span>
                <Button variant="outline" size="sm" onClick={() => onDeleteEdge({ from: e.from, to: e.to, weight: e.weight })}>Delete</Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default ListsSection

