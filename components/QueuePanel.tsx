'use client'

import React from 'react'

export interface QueuePanelProps {
  items?: string[]
}

export function QueuePanel({ items = [] }: QueuePanelProps) {
  return (
    <div className="p-2 text-sm max-h-[40vh] overflow-auto">
      <div className="font-medium mb-1">Frontier</div>
      <ul className="list-disc pl-4">
        {items.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
    </div>
  )
}

export default QueuePanel
