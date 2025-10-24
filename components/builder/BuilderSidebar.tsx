'use client'

import React from 'react'
import type {Graph, GraphEdge, NodeId} from '@/lib/graph/types'
import { ListsSection } from './ListsSection'

export interface BuilderSidebarProps {
  graph: Graph
  onDeleteNode: (id: NodeId) => void
  onDeleteEdge: (key: GraphEdge) => void
}

export function BuilderSidebar({ graph, onDeleteNode, onDeleteEdge }: BuilderSidebarProps) {
  return (
    <div className="space-y-4">
      <ListsSection nodes={graph.nodes} edges={graph.edges} onDeleteNode={onDeleteNode} onDeleteEdge={onDeleteEdge} />
    </div>
  )
}

export default BuilderSidebar
