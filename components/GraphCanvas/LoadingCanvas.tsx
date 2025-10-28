import React from 'react'
import { VIEWBOX_W, VIEWBOX_H } from '@/lib/graph/graph_constants'

export default function LoadingCanvas() {
    return (
        <g>
            <text
                x={VIEWBOX_W / 2}
                y={VIEWBOX_H / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#64748b"
            >
                Loading…
            </text>
        </g>
    )
}