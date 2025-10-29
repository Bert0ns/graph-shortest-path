'use client'

import React from 'react'
import {colors} from '@/lib/graph/graph_constants'

export function Legend() {
    return (
        <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 p-2">
            <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{
                    background: colors.node.normal.fill,
                    border: `1px solid ${colors.node.normal.stroke}`
                }}/> Unexplored Node
            </div>
            <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{
                    background: colors.node.frontier.fill,
                    border: `1px solid ${colors.node.frontier.stroke}`
                }}/> Node in Frontier
            </div>
            <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{
                    background: colors.node.current.fill,
                    border: `1px solid ${colors.node.current.stroke}`
                }}/> Current Node
            </div>
            <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{
                    background: colors.node.visited.fill,
                    border: `1px solid ${colors.node.visited.stroke}`
                }}/> Node path cost Finalized
            </div>
            <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{
                    background: colors.node.path.fill,
                    border: `1px solid ${colors.node.path.stroke}`
                }}/> Optimal Path
            </div>
        </div>
    )
}

export default Legend
