'use client'

import React from 'react'

export type AlgorithmKey = 'dijkstra'

export interface ControlsProps {
  algorithm: AlgorithmKey
  onAlgorithmChange?: (algo: AlgorithmKey) => void
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  onStep?: () => void
  onReset?: () => void
  speed?: number
  onSpeedChange?: (v: number) => void
}

export function Controls({ algorithm, onAlgorithmChange, isPlaying, onPlay, onPause, onStep, onReset, speed = 1, onSpeedChange }: ControlsProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      <label className="text-sm">Algorithm</label>
      <select value={algorithm} onChange={(e) => onAlgorithmChange?.(e.target.value as AlgorithmKey)} className="border rounded px-2 py-1 text-sm">
        <option value="dijkstra">Dijkstra</option>
      </select>
      <button className="border rounded px-2 py-1 text-sm" onClick={isPlaying ? onPause : onPlay}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button className="border rounded px-2 py-1 text-sm" onClick={onStep}>Step</button>
      <button className="border rounded px-2 py-1 text-sm" onClick={onReset}>Reset</button>
      <label className="text-sm ml-2">Speed</label>
      <input type="range" min={0.25} max={2} step={0.25} value={speed} onChange={(e) => onSpeedChange?.(Number(e.target.value))} />
    </div>
  )
}

export default Controls

