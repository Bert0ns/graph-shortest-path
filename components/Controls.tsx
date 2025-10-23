'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    <div className="flex flex-wrap items-center gap-3 p-3 border rounded-md bg-white/60">
      <div className="flex items-center gap-2">
        <Label htmlFor="algo" className="text-sm">Algorithm</Label>
        <Select value={algorithm} onValueChange={(v) => onAlgorithmChange?.(v as AlgorithmKey)}>
          <SelectTrigger id="algo" className="min-w-40">
            <SelectValue placeholder="Select algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dijkstra">Dijkstra</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="default" onClick={isPlaying ? onPause : onPlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button variant="secondary" onClick={onStep}>Step</Button>
        <Button variant="outline" onClick={onReset}>Reset</Button>
      </div>

      <div className="flex items-center gap-2 min-w-64">
        <Label htmlFor="speed" className="text-sm w-12">Speed</Label>
        <Slider id="speed" min={0.25} max={4} step={0.25} value={[speed]} onValueChange={(vals) => onSpeedChange?.(vals[0] ?? speed)} className="w-40" />
        <span className="text-xs text-slate-600 tabular-nums">{speed.toFixed(2)}x</span>
      </div>
    </div>
  )
}

export default Controls
