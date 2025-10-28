"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type AlgorithmKey = string;

export interface ControlsProps {
  algorithm: AlgorithmKey
  onAlgorithmChange?: (algo: AlgorithmKey) => void
  availableAlgorithms: Record<AlgorithmKey, string>;
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  onStep?: () => void
  onReset?: () => void
  speed?: number
  onSpeedChange?: (v: number) => void
}

export function Controls({
  algorithm,
  onAlgorithmChange,
  availableAlgorithms,
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onReset,
  speed = 1,
  onSpeedChange,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 border rounded-md bg-card/60">
      <div
        className="flex items-center gap-2 w-full sm:w-auto"
        title="Select the algorithm to visualize"
      >
        <Label htmlFor="algo" className="text-sm">
          Algorithm
        </Label>
        <Select
          value={algorithm}
          onValueChange={(v) => onAlgorithmChange?.(v as AlgorithmKey)}
        >
          <SelectTrigger id="algo" className="w-full sm:min-w-40">
            <SelectValue placeholder="Select algorithm" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(availableAlgorithms).map(([key, name]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="default"
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? "Pause animation" : "Play animation"}
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button
          variant="secondary"
          onClick={onStep}
          title="Step forward once"
        >
          Step
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          title="Reset to initial state"
        >
          Reset
        </Button>
      </div>

      <div
        className="flex items-center gap-2 w-full sm:w-auto"
        title="Change animation speed"
      >
        <Label htmlFor="speed" className="text-sm w-12">
          Speed
        </Label>
        <Slider
          id="speed"
          min={0.25}
          max={4}
          step={0.25}
          value={[speed]}
          onValueChange={(vals) => onSpeedChange?.(vals[0] ?? speed)}
          className="w-full sm:w-40"
        />
        <span className="text-xs text-muted-foreground tabular-nums">
          {speed.toFixed(2)}x
        </span>
      </div>
    </div>
  )
}

export default Controls
