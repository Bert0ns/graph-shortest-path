'use client'

import React from 'react'

export function Legend() {
  return (
    <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 p-2">
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded bg-chart-1" /> Node
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded bg-chart-2" /> Frontier
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded bg-chart-4" /> Current
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded bg-chart-5" /> Finalized
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded bg-chart-3" /> Path
      </div>
    </div>
  )
}

export default Legend
