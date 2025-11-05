"use client"
import React, { Suspense } from 'react'
import GraphSimulator from '@/components/GraphSimulator'
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {websiteConfigs} from "@/website.configs";

export default function SimulatorPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Simulator</h1>
            <Link href={websiteConfigs.menuItems[2].link} >
                <Button className="mt-2" variant="secondary">
                    Open Builder
                </Button>
            </Link>
            <Suspense fallback={<div className="p-6 text-muted-foreground">Loading…</div>}>
                <GraphSimulator/>
            </Suspense>
        </div>
    )
}
