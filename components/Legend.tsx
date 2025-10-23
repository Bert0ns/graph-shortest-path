'use client'

import React from 'react'

export function Legend() {
  return (
    <div className="text-xs text-slate-700 grid grid-cols-2 gap-2 p-2">
      {/* Placeholder legend per pastel palette */}
      <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ background: '#A7F3D0', border: '1px solid #34D399' }} /> Node</div>
      <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ background: '#BFDBFE', border: '1px solid #60A5FA' }} /> Frontier</div>
      <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ background: '#FDE68A', border: '1px solid #F59E0B' }} /> Current</div>
      <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ background: '#FCA5A5', border: '1px solid #F87171' }} /> Finalized</div>
      <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ background: '#C4B5FD', border: '1px solid #8B5CF6' }} /> Path</div>
    </div>
  )
}

export default Legend

