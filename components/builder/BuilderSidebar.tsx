'use client'

import React from 'react'
import type {Graph, GraphNode, GraphEdge, NodeId} from '@/lib/graph/types'
import { MetadataSection } from './MetadataSection'
import { AddNodeSection } from './AddNodeSection'
import { AddEdgeSection } from './AddEdgeSection'
import { ListsSection } from './ListsSection'

export interface BuilderSidebarProps {
  graph: Graph
  onCreateNode: (node: GraphNode) => void
  onCreateEdge: (edge: GraphEdge) => void
  onUpdateMetadata: (meta: Partial<Graph['metadata']>) => void
  onDeleteNode: (id: NodeId) => void
  onDeleteEdge: (key: GraphEdge) => void
}

export function BuilderSidebar({ graph, onCreateNode, onCreateEdge, onUpdateMetadata, onDeleteNode, onDeleteEdge }: BuilderSidebarProps) {
  return (
    <div className="space-y-4">
      <MetadataSection metadata={graph.metadata} onUpdateMetadata={onUpdateMetadata} />
      <AddNodeSection onCreateNode={onCreateNode} />
      <AddEdgeSection nodes={graph.nodes} onCreateEdge={onCreateEdge} />
      <ListsSection nodes={graph.nodes} edges={graph.edges} onDeleteNode={onDeleteNode} onDeleteEdge={onDeleteEdge} />
    </div>
  )
}

export default BuilderSidebar
