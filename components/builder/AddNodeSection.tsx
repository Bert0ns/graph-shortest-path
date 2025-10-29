'use client'

import React from 'react'
import type {GraphNode} from '@/lib/graph/types'
import {Label} from '@/components/ui/label'
import {Button} from '@/components/ui/button'
import {toast} from "sonner";
import { DEFAULT_NODE_X, DEFAULT_NODE_Y } from '@/lib/graph/graph_constants'

export interface AddNodeSectionProps {
    onCreateNode: (node: GraphNode) => void
}

export function AddNodeSection({onCreateNode}: AddNodeSectionProps) {
    const [nodeForm, setNodeForm] = React.useState({id: '', x: DEFAULT_NODE_X, y: DEFAULT_NODE_Y, label: ''})

    return (
        <section className="bg-card/70 border rounded-md p-3 space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Add Node</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="col-span-2">
                    <Label htmlFor="nid">ID</Label>
                    <input id="nid" className="w-full border rounded px-2 py-1" value={nodeForm.id}
                           onChange={(e) => setNodeForm({...nodeForm, id: e.target.value})}/>
                </div>
                <div>
                    <Label htmlFor="nx">x</Label>
                    <input id="nx" type="number" min={0} max={1} step={0.01} className="w-full border rounded px-2 py-1"
                           value={nodeForm.x} onChange={(e) => setNodeForm({...nodeForm, x: Number(e.target.value)})}/>
                </div>
                <div>
                    <Label htmlFor="ny">y</Label>
                    <input id="ny" type="number" min={0} max={1} step={0.01} className="w-full border rounded px-2 py-1"
                           value={nodeForm.y} onChange={(e) => setNodeForm({...nodeForm, y: Number(e.target.value)})}/>
                </div>
                <div className="col-span-2">
                    <Label htmlFor="nlabel">Label (optional)</Label>
                    <input id="nlabel" className="w-full border rounded px-2 py-1" value={nodeForm.label}
                           onChange={(e) => setNodeForm({...nodeForm, label: e.target.value})}/>
                </div>
                <div className="col-span-2 flex justify-end">
                    <Button onClick={() => {
                        if (nodeForm.id.trim() === '') {
                            toast('Node ID cannot be empty');
                            return;
                        }
                        onCreateNode({
                            id: nodeForm.id,
                            x: nodeForm.x,
                            y: nodeForm.y,
                            label: nodeForm.label || undefined
                        });
                        setNodeForm({id: '', x: DEFAULT_NODE_X, y: DEFAULT_NODE_Y, label: ''})
                    }}>Add Node</Button>
                </div>
            </div>
        </section>
    )
}

export default AddNodeSection
