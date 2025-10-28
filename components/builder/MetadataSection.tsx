'use client'

import React from 'react'
import type { Graph } from '@/lib/graph/types'
import { Label } from '@/components/ui/label'

export interface MetadataSectionProps {
  metadata: Graph['metadata']
  onUpdateMetadata: (meta: Partial<Graph['metadata']>) => void
}

export function MetadataSection({ metadata, onUpdateMetadata }: MetadataSectionProps) {
  return (
    <section className="bg-card/70 border rounded-md p-3 space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Metadata</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 col-span-2">
          <input id="directed" type="checkbox" checked={metadata.directed} onChange={(e) => onUpdateMetadata({ directed: e.target.checked })} />
          <Label htmlFor="directed">Directed</Label>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <input id="weighted" type="checkbox" checked={metadata.weighted} onChange={(e) => onUpdateMetadata({ weighted: e.target.checked })} />
          <Label htmlFor="weighted">Weighted</Label>
        </div>
        <div className="col-span-2">
          <Label htmlFor="name">Name</Label>
          <input id="name" className="w-full border rounded px-2 py-1" value={metadata.name ?? ''} onChange={(e) => onUpdateMetadata({ name: e.target.value })} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="desc">Description</Label>
          <textarea id="desc" className="w-full border rounded px-2 py-1" value={metadata.description ?? ''} onChange={(e) => onUpdateMetadata({ description: e.target.value })} />
        </div>
      </div>
    </section>
  )
}

export default MetadataSection
