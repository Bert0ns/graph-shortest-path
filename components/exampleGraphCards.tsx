"use client"
import ExampleGraphCard from "@/components/exampleGraphCard";
import React, {useEffect} from "react";
import {Graph} from "@/lib/graph/types";
import {loadGraphFromUrl} from "@/lib/graph/loader";

export interface ExampleGraphCardsProps {
    className: string;
}

const ExampleGraphCards = ({className = " "}: ExampleGraphCardsProps) => {
    const [exampleGraphs, setExampleGraphs] = React.useState<Graph[]>([])

    useEffect(() => {
        // Load all JSON files available in public/graphs/*
        (async () => {
            try {
                const res = await fetch('/api/graphs', { cache: 'no-store' })
                if (!res.ok) throw new Error(`Failed to list graphs: ${res.status}`)
                const data = (await res.json()) as { files: string[] }
                const files = Array.isArray(data.files) ? data.files : []

                if (files.length === 0) {
                    console.warn('No example graphs found in /public/graphs')
                    setExampleGraphs([])
                    return
                }

                for (const f of files) {
                    loadGraphFromUrl(f).then((g) => {
                        setExampleGraphs((prev) => [...prev, g])
                    })
                }
            } catch (err) {
                console.warn('Unexpected error while loading examples:', err)
                setExampleGraphs([])
            }
        })()
    }, [])

    return (
        <div className={className}>
            {exampleGraphs.map((g, i) => <ExampleGraphCard g={g} key={i} />)}
        </div>
    )
}

export default ExampleGraphCards;