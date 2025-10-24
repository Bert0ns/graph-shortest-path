'use client'

import React from 'react'
import type {Graph, GraphNode, GraphEdge} from '@/lib/graph/types'
import { MetadataSection } from './MetadataSection'
import { AddNodeSection } from './AddNodeSection'
import { AddEdgeSection } from './AddEdgeSection'

export interface BuilderTopbarProps {
  graph: Graph
  onCreateNode: (node: GraphNode) => void
  onCreateEdge: (edge: GraphEdge) => void
  onUpdateMetadata: (meta: Partial<Graph['metadata']>) => void
}

export function BuilderTopbar({ graph, onCreateNode, onCreateEdge, onUpdateMetadata }: BuilderTopbarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <MetadataSection metadata={graph.metadata} onUpdateMetadata={onUpdateMetadata} />
      </div>

      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <AddNodeSection onCreateNode={onCreateNode} />
        </div>
        <div className="w-full md:w-1/2">
          <AddEdgeSection nodes={graph.nodes} onCreateEdge={onCreateEdge} />
        </div>
      </div>
    </div>
  )
}

export default BuilderTopbar
